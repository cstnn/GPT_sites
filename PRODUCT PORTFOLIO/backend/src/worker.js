export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = {"content-type":"application/json","cache-control":"no-store"};
    if (request.method === "GET" && url.pathname === "/api/products") {
      const {results}=await env.DB.prepare("SELECT * FROM products ORDER BY updated_at DESC").all();
      return new Response(JSON.stringify({products:results}),{headers:cors});
    }
    if (request.method === "PATCH" && url.pathname.startsWith("/api/products/")) {
      const id=decodeURIComponent(url.pathname.split("/").pop());
      const body=await request.json();
      const allowedStages=["idea","specs","3mf","to_print","printed","published"];
      const old=await env.DB.prepare("SELECT * FROM products WHERE product_id=?").bind(id).first();
      if(!old) return new Response(JSON.stringify({error:"not_found"}),{status:404,headers:cors});
      const stage=body.stage??old.stage;
      if(!allowedStages.includes(stage)) return new Response(JSON.stringify({error:"invalid_stage"}),{status:400,headers:cors});
      const next=body.next_action??old.next_action, blocked=body.blocked===undefined?old.blocked:(body.blocked?1:0);
      const reason=body.blocker_reason===undefined?old.blocker_reason:body.blocker_reason;
      const now=new Date().toISOString();
      await env.DB.prepare("UPDATE products SET stage=?,next_action=?,blocked=?,blocker_reason=?,updated_at=?,last_update_source='dashboard' WHERE product_id=?")
        .bind(stage,next,blocked,reason,now,id).run();
      if(stage!==old.stage) await env.DB.prepare("INSERT INTO history(product_id,at,source,field,old_value,new_value,note) VALUES(?,?,?,?,?,?,?)")
        .bind(id,now,"dashboard","stage",old.stage,stage,"Manual dashboard change").run();
      const product=await env.DB.prepare("SELECT * FROM products WHERE product_id=?").bind(id).first();
      return new Response(JSON.stringify({product}),{headers:cors});
    }
    return new Response(JSON.stringify({error:"not_found"}),{status:404,headers:cors});
  }
};