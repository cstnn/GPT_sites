const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
(async()=>{
 const storage=new Map();let remote={schema_version:4,products:[{product_id:'one',product_name:'Lamp',stage:'idea',updated_at:'2026-01-01T00:00:00Z',publication:{thangs:null,makerworld:null}}]},revision='v1',fail=false;
 function Runner(success,failure){this.success=success;this.failure=failure}
 Runner.prototype.withSuccessHandler=function(fn){return new Runner(fn,this.failure)};Runner.prototype.withFailureHandler=function(fn){return new Runner(this.success,fn)};
 Runner.prototype.getPortfolio=function(){queueMicrotask(()=>this.success({portfolio:structuredClone(remote),revision}))};
 Runner.prototype.saveProduct=function(req){queueMicrotask(()=>{if(fail)return this.failure({message:'Offline'});if(req.revision!==revision)return this.failure({message:'CONFLICT'});remote.products[0]={...remote.products[0],...req.patch};revision='v'+(Number(revision.slice(1))+1);this.success({portfolio:structuredClone(remote),revision})})};
 const c=vm.createContext({localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},crypto:webcrypto,google:{script:{run:new Runner()}},window:{HUB_APP_URL:'https://script.google.com/macros/s/test/exec'}});
 vm.runInContext(fs.readFileSync(__dirname+'/../site/assets/store.js','utf8'),c);vm.runInContext(fs.readFileSync(__dirname+'/../google-apps-script/bridge.js','utf8'),c);const D=vm.runInContext('HubDrive',c),S=c.HubStore;
 await D.load();const p=S.effective(remote.products[0]);await D.save(p,{notes:'Saved'},'v1');assert.equal(remote.products[0].notes,'Saved');assert.equal(S.effective(remote.products[0]).pending,false);
 fail=true;await assert.rejects(D.save(S.effective(remote.products[0]),{notes:'Draft survives'},D.revision),/Offline/);assert.equal(S.effective(remote.products[0]).notes,'Draft survives');assert.equal(remote.products[0].notes,'Saved');
 fail=false;await assert.rejects(D.save(S.effective(remote.products[0]),{notes:'Stale'},'v1'),/CONFLICT/);assert.equal(S.effective(remote.products[0]).pending,true);
 console.log('Google transport: verified save acknowledgement, offline draft retention and stale revision rejection passed.');
})().catch(e=>{console.error(e);process.exitCode=1});
