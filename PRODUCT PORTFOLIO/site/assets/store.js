/* Shared browser workspace. Canonical portfolio files are never mutated here. */
(function(root){
'use strict';
const STAGES={idea:'Idea / Concept',specs_ready:'Specs ready','3mf_ready':'3MF ready',print_ready:'Print ready',to_publish:'To Publish',published:'Published'};
const KEY='product-hub-workspace-v1', BOARD='product-dashboard-overrides-v1';
function read(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{throw Error('Saved browser data could not be read. Export/recover it before making changes.')}}
function state(){return read(KEY,{drafts:[],edits:{},events:[]})}
function save(s){localStorage.setItem(KEY,JSON.stringify(s))}
function effective(p){const s=state(),b=read(BOARD,{})[p.product_id]||{},e=s.edits[p.product_id]||{};const legacy={specs:'specs_ready','3mf':'3mf_ready',to_print:'print_ready',printed:'to_publish'};return {...p,...e,...b,stage:legacy[b.stage||p.stage]||b.stage||p.stage,publication:{...p.publication,...e.publication,...b.publication},pending:!!(Object.keys(e).length||Object.keys(b).length),local_conflict:!!(s.bases?.[p.product_id]&&p.updated_at&&p.updated_at>s.bases[p.product_id]),history:[...(p.history||[]),...s.events.filter(x=>x.product_id===p.product_id)]}}
function products(snapshot){return [...snapshot.products,...state().drafts].map(effective)}
function change(p,patch){const s=state(),at=new Date().toISOString(),board=read(BOARD,{});patch=Object.fromEntries(Object.entries(patch).filter(([k,v])=>JSON.stringify(p[k])!==JSON.stringify(v)));if(!Object.keys(patch).length)return p;for(const [field,to] of Object.entries(patch)){if(JSON.stringify(p[field])!==JSON.stringify(to))s.events.push({product_id:p.product_id,at,source:'browser_draft',field,from:p[field]??null,to,note:'Pending local edit'});}
s.bases=s.bases||{};s.bases[p.product_id]=s.bases[p.product_id]||p.updated_at||p.created_at;const {stage,publication,...details}=patch;s.edits[p.product_id]={...s.edits[p.product_id],...details};
if(stage!==undefined){if(!STAGES[stage])throw Error('Unknown stage');board[p.product_id]={...board[p.product_id],stage,stage_updated_at:at,updated_at:at,update_source:'dashboard'}}
if(publication){board[p.product_id]={...board[p.product_id],publication:{...board[p.product_id]?.publication,...publication},publication_updated_at:{...board[p.product_id]?.publication_updated_at,...Object.fromEntries(Object.keys(publication).map(k=>[k,at]))},updated_at:at,update_source:'dashboard'}}
// Write workspace before board: a failed storage write is surfaced, never reported as saved.
save(s);localStorage.setItem(BOARD,JSON.stringify(board));return effective(p)}
function create(name,description,image){if(!name.trim())throw Error('Name is required');const s=state(),p={product_id:'draft:'+crypto.randomUUID(),product_name:name.trim(),description,hero_asset_url:image||'',stage:'idea',draft:true,created_at:new Date().toISOString(),publication:{thangs:null,makerworld:null},next_action:'Develop concept; create Drive folder through the Project workflow'};s.drafts.push(p);save(s);return p}
function download(value,name){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function backup(){download({type:'product_hub_backup',version:1,workspace:state(),board:read(BOARD,{})},'product-hub-backup.json')}
function restore(payload){
 if(payload?.type!=='product_hub_backup'||payload.version!==1||!payload.workspace||!Array.isArray(payload.workspace.drafts)||!payload.workspace.edits||!Array.isArray(payload.workspace.events)||!payload.board)throw Error('Invalid Product Hub backup');
 const incoming=payload.workspace;
 if(typeof incoming.edits!=='object'||Array.isArray(incoming.edits)||typeof payload.board!=='object'||Array.isArray(payload.board)||Object.values(incoming.edits).some(e=>!e||typeof e!=='object'||['product_id','folder_id','history'].some(k=>k in e)))throw Error('Invalid edit backup');
 if(incoming.drafts.some(p=>typeof p.product_id!=='string'||!p.product_id.startsWith('draft:')||typeof p.product_name!=='string'||!STAGES[p.stage]))throw Error('Invalid idea in backup');
 for(const [id,b] of Object.entries(payload.board)){if(['__proto__','constructor','prototype'].includes(id)||b.stage&&!STAGES[b.stage])throw Error('Invalid stage backup');}
 const current=state(),board=read(BOARD,{});
 // Additive recovery only. Never replace a device's newer pending edits.
 const merged={...current,drafts:[...current.drafts,...incoming.drafts.filter(p=>!current.drafts.some(x=>x.product_id===p.product_id))],edits:{...incoming.edits,...current.edits},bases:{...incoming.bases,...current.bases},events:[...current.events,...incoming.events.filter(e=>!current.events.some(x=>JSON.stringify(x)===JSON.stringify(e)))]};
 save(merged);localStorage.setItem(BOARD,JSON.stringify({...payload.board,...board}));
}
root.HubStore={restore,STAGES,state,effective,products,change,create,backup,download,board:()=>read(BOARD,{})};
})(globalThis);
