// Verify Cloudflare Access JWT cryptographically; fail closed without configuration.
async function authorize(request, env) {
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.ALLOWED_EMAILS) return false;
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN)) return false;
  try {
    const token=request.headers.get('Cf-Access-Jwt-Assertion')||'';
    const parts=token.split('.'); if(parts.length!==3) return false;
    const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
    const header=JSON.parse(new TextDecoder().decode(decode(parts[0])));
    const claims=JSON.parse(new TextDecoder().decode(decode(parts[1])));
    const issuer='https://'+env.ACCESS_TEAM_DOMAIN, now=Date.now()/1000;
    if(header.alg!=='RS256'||claims.iss!==issuer||!Number.isFinite(claims.exp)||claims.exp<=now||!Number.isFinite(claims.iat)||claims.iat>now+30||(claims.nbf && claims.nbf>now)) return false;
    if(!(Array.isArray(claims.aud)?claims.aud:[claims.aud]).includes(env.ACCESS_AUD)) return false;
    if(!env.ALLOWED_EMAILS.split(',').map(s=>s.trim().toLowerCase()).includes(String(claims.email||'').toLowerCase())) return false;
    const response=await fetch(issuer+'/cdn-cgi/access/certs'); if(!response.ok) return false;
    const jwk=(await response.json()).keys.find(k=>k.kid===header.kid&&k.kty==='RSA'); if(!jwk)return false;
    const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
  } catch { return false; }
}
const serialize=p=>{const {publication_thangs,publication_makerworld,snapshot_json,...rest}=p;return {...JSON.parse(snapshot_json||'{}'),...rest,publication:{thangs:publication_thangs==null?null:!!publication_thangs,makerworld:publication_makerworld==null?null:!!publication_makerworld}}};
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {"content-type":"application/json","cache-control":"no-store"};
    if (request.method === "GET" && url.pathname === "/api/health") {
      return new Response(JSON.stringify({ok:true}),{headers:cors});
    }
    if (!await authorize(request,env)) return new Response(JSON.stringify({error:'unauthorized'}),{status:401,headers:cors});
    if(request.method!=='GET' && request.headers.get('Origin')!==url.origin) return new Response(JSON.stringify({error:'same_origin_required'}),{status:403,headers:cors});
    const historyMatch=url.pathname.match(/^\/api\/products\/([^/]+)\/history$/);
    if(request.method==="GET" && historyMatch){
      const id=decodeURIComponent(historyMatch[1]);
      const {results}=await env.DB.prepare("SELECT at,source,field,old_value,new_value,note FROM history WHERE product_id=? ORDER BY at DESC,id DESC LIMIT 100").bind(id).all();
      return new Response(JSON.stringify({history:results}),{headers:cors});
    }
    if (request.method === "GET" && url.pathname === "/api/products") {
      const {results}=await env.DB.prepare("SELECT * FROM products ORDER BY updated_at DESC").all();
      return new Response(JSON.stringify({products:results.map(serialize)}),{headers:cors});
    }
    if (request.method === "PATCH" && url.pathname.startsWith("/api/products/")) {
      const id=decodeURIComponent(url.pathname.split("/").pop());
      if(!request.headers.get('content-type')?.startsWith('application/json')) return new Response(JSON.stringify({error:'json_required'}),{status:415,headers:cors});
      let body; try { const raw=await request.text(); if(raw.length>20000)throw Error(); body=JSON.parse(raw); }catch {return new Response(JSON.stringify({error:'invalid_json'}),{status:400,headers:cors})}
      if(!body || typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!['stage','blocked','next_action','blocker_reason','publication'].includes(k))||['next_action','blocker_reason'].some(k=>body[k]!==undefined&&(typeof body[k]!=='string'||body[k].length>5000))||(body.blocked!==undefined&&typeof body.blocked!=='boolean'))return new Response(JSON.stringify({error:'invalid_fields'}),{status:400,headers:cors});
      const allowedStages=["idea","specs_ready","3mf_ready","print_ready","to_publish","published"];
      const old=await env.DB.prepare("SELECT * FROM products WHERE product_id=?").bind(id).first();
      if(!old) return new Response(JSON.stringify({error:"not_found"}),{status:404,headers:cors});
      const expected=request.headers.get('If-Match');
      if(!expected)return new Response(JSON.stringify({error:'if_match_required'}),{status:428,headers:cors});
      if(expected!==old.updated_at)return new Response(JSON.stringify({error:'conflict',current_updated_at:old.updated_at}),{status:409,headers:cors});
      const stage=body.stage??old.stage;
      if(!allowedStages.includes(stage)) return new Response(JSON.stringify({error:"invalid_stage"}),{status:400,headers:cors});
      const next=body.next_action??old.next_action, blocked=body.blocked===undefined?old.blocked:(body.blocked?1:0);
      const reason=body.blocker_reason===undefined?old.blocker_reason:body.blocker_reason;
      const publication=body.publication??{};
      if(!publication || typeof publication!=="object" || Array.isArray(publication) || Object.entries(publication).some(([k,v])=>!["thangs","makerworld"].includes(k)||typeof v!=="boolean")) return new Response(JSON.stringify({error:"invalid_publication"}),{status:400,headers:cors});
      const thangs=publication.thangs===undefined?old.publication_thangs:Number(publication.thangs);
      const makerworld=publication.makerworld===undefined?old.publication_makerworld:Number(publication.makerworld);
      const now=new Date(Math.max(Date.now(),(Date.parse(old.updated_at)||0)+1)).toISOString();
      const statements=[env.DB.prepare("UPDATE products SET stage=?,next_action=?,blocked=?,blocker_reason=?,updated_at=?,last_update_source='dashboard',publication_thangs=?,publication_makerworld=? WHERE product_id=? AND updated_at=?")
        .bind(stage,next,blocked,reason,now,thangs,makerworld,id,expected)];
      const changes=[["publication.thangs",old.publication_thangs,thangs],["publication.makerworld",old.publication_makerworld,makerworld],["stage",old.stage,stage],["next_action",old.next_action,next],["blocked",String(old.blocked),String(blocked)],["blocker_reason",old.blocker_reason,reason]];
      for(const [field,before,after] of changes){ if(String(before??"")!==String(after??"")) statements.unshift(env.DB.prepare("INSERT INTO history(product_id,at,source,field,old_value,new_value,note) SELECT ?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM products WHERE product_id=? AND updated_at=?)").bind(id,now,"dashboard",field,before==null?null:String(before),after==null?null:String(after),"Manual dashboard change",id,expected)); }
      const results=await env.DB.batch(statements);
      if(results.at(-1)?.meta?.changes!==1)return new Response(JSON.stringify({error:"conflict"}),{status:409,headers:cors});
      const product=await env.DB.prepare("SELECT * FROM products WHERE product_id=?").bind(id).first();
      return new Response(JSON.stringify({product:serialize(product)}),{headers:cors});
    }
    return new Response(JSON.stringify({error:"not_found"}),{status:404,headers:cors});
  }
};