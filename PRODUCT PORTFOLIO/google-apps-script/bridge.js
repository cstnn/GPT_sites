/* Private Apps Script transport. Google handles the authenticated RPC session. */
const HubDrive = (() => {
  let revision = null, snapshot = null, busy = false;
  const keys = {workspace:'product-hub-workspace-v1',board:'product-dashboard-overrides-v1'};
  function rpc(method, request) {
    return new Promise((resolve,reject) => google.script.run.withSuccessHandler(resolve).withFailureHandler(error=>reject(new Error(error.message || 'Drive request failed. Your draft is retained.')))[method](request));
  }
  function accept(result) { revision=result.revision; snapshot=result.portfolio; return snapshot; }
  function savedState(){ return {workspace:HubStore.state(),board:HubStore.board()}; }
  function acknowledge(id, before, created) {
    const current = savedState();
    if (created) current.workspace.drafts=current.workspace.drafts.filter(p=>p.product_id!==id);
    else {
      if(JSON.stringify(current.workspace.edits[id])===JSON.stringify(before.workspace.edits[id]))delete current.workspace.edits[id];
      if(JSON.stringify(current.board[id])===JSON.stringify(before.board[id]))delete current.board[id];
      const oldEvents=before.workspace.events.filter(e=>e.product_id===id);
      current.workspace.events=current.workspace.events.filter(e=>e.product_id!==id||!oldEvents.some(old=>JSON.stringify(e)===JSON.stringify(old)));
      if(!current.workspace.edits[id]&&!current.board[id]&&current.workspace.bases)delete current.workspace.bases[id];
    }
    localStorage.setItem(keys.workspace,JSON.stringify(current.workspace));localStorage.setItem(keys.board,JSON.stringify(current.board));
  }
  return {
    get revision(){return revision},get snapshot(){return snapshot},
    url(page,id){return window.HUB_APP_URL+'?page='+page+(id?'&product='+encodeURIComponent(id):'')},
    async load(){return accept(await rpc('getPortfolio'))},
    async save(product, patch, expected) {
      if(busy)throw Error('A save is still running. Please wait.');
      HubStore.change(product,patch); // Retain a local draft if anything after this fails.
      if(product.draft)throw Error('This idea is still local. Use Create Drive folder and save idea first.');
      if(product.local_conflict)throw Error('Drive changed since these local edits. Review your backup against Drive before saving.');
      if(!revision)throw Error('Drive has not loaded. Reload before saving.');
      const before=savedState(), pending={...before.workspace.edits[product.product_id]};
      const board=before.board[product.product_id]||{};
      if(board.stage!==undefined)pending.stage=board.stage;if(board.publication)pending.publication=board.publication;
      busy=true;
      try {
        const response=await rpc('saveProduct',{productId:product.product_id,patch:pending,revision:expected,requestId:crypto.randomUUID()});
        accept(response);acknowledge(product.product_id,before,false);return snapshot;
      } finally {busy=false}
    },
    async create(product) {
      if(busy)throw Error('A save is still running. Please wait.');
      if(!revision)throw Error('Drive has not loaded. Idea kept locally.');
      busy=true;const before=savedState();
      try {const response=await rpc('createIdea',{productId:product.product_id,name:product.product_name,description:product.description||'',image:product.hero_asset_url||'',revision});accept(response);acknowledge(product.product_id,before,true);return snapshot} finally {busy=false}
    },
    async previewScan(scan){return rpc('previewReconciliation',{scan,revision})},
    async reconcile(scan,expected){if(busy)throw Error('A save is running.');busy=true;try{return accept(await rpc('reconcilePortfolio',{scan,revision:expected}))}finally{busy=false}}
  };
})();
