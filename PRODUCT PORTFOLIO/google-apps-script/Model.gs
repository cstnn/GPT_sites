/* Pure, lossless portfolio operations. Shared by Apps Script and Node tests. */
var PortfolioModel = (function () {
  var stages = ['idea','specs_ready','3mf_ready','print_ready','to_publish','published'];
  var legacy = {specs:'specs_ready','3mf':'3mf_ready',to_print:'print_ready',printed:'to_publish'};
  var strings = ['product_name','description','next_action','blocker_reason','category','notes','design_notes','test_results','print_time','filament_weight','printing_notes','marketing_notes','thangs_url','makerworld_url','seasonality'];
  function copy(value) { return JSON.parse(JSON.stringify(value)); }
  function fail(message) { throw new Error(message); }
  function validate(data) {
    if (!data || !Array.isArray(data.products) || ![3,4].includes(data.schema_version)) fail('Invalid portfolio schema.');
    var ids = new Set();
    data.products.forEach(function (p) {
      if (!p || typeof p.product_id !== 'string' || !p.product_id || ids.has(p.product_id) || !stages.includes(legacy[p.stage] || p.stage)) fail('Invalid or duplicate product identity/stage.');
      ids.add(p.product_id);
    });
    return data;
  }
  function migrate(data, baseline) {
    validate(data); var next = copy(data), previous = {};
    (baseline.products || []).forEach(function (p) { previous[p.product_id] = p; });
    next.products.forEach(function (p) {
      p.stage = legacy[p.stage] || p.stage;
      p.publication = p.publication || {thangs:null,makerworld:null};
      var saved = previous[p.product_id];
      ['thangs','makerworld'].forEach(function (platform) {
        if (p.publication[platform] === undefined) p.publication[platform] = null;
        var oldAt = saved && saved.publication_updated_at && saved.publication_updated_at[platform];
        var at = p.publication_updated_at && p.publication_updated_at[platform];
        if (oldAt && (!at || Date.parse(oldAt) > Date.parse(at))) {
          p.publication[platform] = saved.publication[platform];
          p.publication_updated_at = p.publication_updated_at || {};
          p.publication_updated_at[platform] = oldAt;
        }
      });
      if (saved) {
        p.history = p.history || [];
        (saved.history || []).forEach(function (event) { if (!p.history.some(function (e) { return JSON.stringify(e) === JSON.stringify(event); })) p.history.push(copy(event)); });
        if (saved.last_update_source === 'dashboard' && Date.parse(saved.updated_at) > Date.parse(p.updated_at || 0)) {
          if (p.stage !== saved.stage) p.needs_review = true;
          p.stage = saved.stage; p.updated_at = saved.updated_at; p.last_update_source = 'dashboard';
        }
      }
    });
    next.schema_version = 4;
    if (next.reconciliation && next.reconciliation.stage_counts) {
      next.reconciliation.stage_counts = Object.fromEntries(stages.map(function (s) { return [s,next.products.filter(function (p) { return p.stage === s; }).length]; }));
    }
    return next;
  }
  function patchValid(patch) {
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) fail('Invalid changes.');
    Object.keys(patch).forEach(function (field) {
      var value = patch[field];
      if (strings.includes(field)) {
        if (typeof value !== 'string' || value.length > 12000) fail('Invalid '+field);
        if (field === 'product_name' && !value.trim()) fail('Name is required.');
        if (field.endsWith('_url') && value && !/^https:\/\//.test(value)) fail('Listing URLs must use HTTPS.');
        if (field === 'seasonality' && !['','seasonal','year_round'].includes(value)) fail('Use seasonal or year_round.');
      } else if (field === 'stage') { if (!stages.includes(value)) fail('Unknown stage.'); }
      else if (field === 'blocked') { if (typeof value !== 'boolean') fail('Blocked must be boolean.'); }
      else if (field === 'publication') {
        if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(function (k) { return !['thangs','makerworld'].includes(k) || typeof value[k] !== 'boolean'; })) fail('Invalid marketplace state.');
      } else if (['customer_interest_score','commercial_appeal_score'].includes(field)) { if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 10) fail('Scores must be between 0 and 10.'); }
      else if (field === 'seasons') { if (!Array.isArray(value) || value.length > 30 || value.some(function (v) { return typeof v !== 'string' || v.length > 100; })) fail('Invalid seasons.'); }
      else if (field === 'tasks') { if (!Array.isArray(value) || value.length > 300 || value.some(function (t) { return !t || typeof t.text !== 'string' || !t.text.trim() || t.text.length > 1000 || typeof t.done !== 'boolean' || typeof t.id !== 'string'; })) fail('Invalid tasks.'); }
      else fail('This field cannot be edited: '+field);
    });
    return patch;
  }
  function apply(data, id, patch, actor, at) {
    validate(data); if (data.schema_version !== 4) fail('MIGRATION_REQUIRED: Upgrade the Drive portfolio first.'); patchValid(patch);
    var next = copy(data), p = next.products.find(function (p) { return p.product_id === id; });
    if (!p) fail('Product not found. Reload before saving.');
    var gate = (p.location || '').split('/').includes('PUBLISHED') ? 'published' : (p.location || '').split('/').includes('READY TO PUBLISH') ? 'to_publish' : null;
    if (patch.stage && gate && patch.stage !== gate) fail('This stage is set by its Drive folder. Move the folder through the workflow first.');
    var changed = false;
    function update(field, before, after) {
      if (JSON.stringify(before) === JSON.stringify(after)) return;
      changed = true; p.history = p.history || [];
      p.history.push({at:at,source:'dashboard',actor:actor,field:field,from:before === undefined ? null : before,to:copy(after),note:'Saved from NORHOLM Studio to Drive'});
      p.hub_field_updated_at = p.hub_field_updated_at || {}; p.hub_field_updated_at[field] = at;
    }
    Object.keys(patch).forEach(function (field) {
      if (field === 'publication') Object.keys(patch.publication).forEach(function (platform) {
        p.publication = p.publication || {thangs:null,makerworld:null};
        update('publication.'+platform,p.publication[platform],patch.publication[platform]);
        if (p.publication[platform] !== patch.publication[platform]) { p.publication_updated_at = p.publication_updated_at || {}; p.publication_updated_at[platform] = at; }
        p.publication[platform] = patch.publication[platform];
      }); else { update(field,p[field],patch[field]); p[field] = copy(patch[field]); }
    });
    if (changed) { p.updated_at = at; p.last_update_source = 'dashboard'; next.generated_at = at; }
    return next;
  }
  function reconcile(data, scan, actor, at) {
    validate(data); validate(scan);
    if (!scan.reconciliation || scan.reconciliation.complete !== true || scan.root_folder_id !== data.root_folder_id || !scan.products.length || !Number.isFinite(Date.parse(scan.reconciliation.scanned_at))) fail('A successful complete scan of the same Drive tree is required.');
    var scanAt = Date.parse(scan.reconciliation.scanned_at);
    if (data.products.some(function(p){return p.created_at && Date.parse(p.created_at)>scanAt && !scan.products.some(function(n){return n.product_id===p.product_id || n.folder_id && n.folder_id===p.folder_id;});})) fail('Scan predates a newly created product. Run a fresh complete scan.');
    var next = copy(data), prior = Object.fromEntries(data.products.map(function (p) { return [p.product_id,p]; }));
    var byFolder = Object.fromEntries(data.products.filter(function(p){return p.folder_id;}).map(function(p){return [p.folder_id,p];}));
    var scanFields = ['folder_id','folder_url','location','hero_asset_id','hero_asset_url','hero_kind','has_specs','has_3mf','has_marketplace','printed','published','needs_review'];
    var seen = new Set();
    next.products = scan.products.map(function (incoming) {
      var old = prior[incoming.product_id] || byFolder[incoming.folder_id];
      var p = old ? copy(old) : copy(incoming); if (old) seen.add(old.product_id);
      scanFields.forEach(function (k) { if (Object.prototype.hasOwnProperty.call(incoming,k)) p[k] = copy(incoming[k]); });
      var proposed = legacy[incoming.stage] || incoming.stage;
      var parts = (p.location || '').split('/');
      var gate = parts.includes('PUBLISHED') ? 'published' : parts.includes('READY TO PUBLISH') ? 'to_publish' : null;
      var stageAt = old && (old.hub_field_updated_at || {}).stage;
      if (!old || gate || !stageAt || Date.parse(incoming.updated_at || 0) > Date.parse(stageAt)) p.stage = gate || proposed;
      else if (proposed !== old.stage) p.needs_review = true;
      if (old && old.stage !== p.stage) { p.history = p.history || []; p.history.push({at:at,source:'folder_reconciliation',actor:actor,field:'stage',from:old.stage,to:p.stage,note:'Complete scan evidence'}); }
      return p;
    });
    if (new Set(next.products.map(function(p){return p.product_id;})).size !== next.products.length) fail('Multiple folders resolve to the same product ID.');
    next.reconciliation = copy(scan.reconciliation); next.generated_at = at; next.schema_version = 4;
    next.hub_history = next.hub_history || [];
    var removed = data.products.filter(function(p){return !seen.has(p.product_id) && !next.products.some(function(n){return n.product_id===p.product_id;});});
    next.hub_history.push({at:at,source:'folder_reconciliation',actor:actor,removed_product_ids:removed.map(function(p){return p.product_id;}),note:'Membership reconciled after a complete scan'});
    return next;
  }
  return {validate:validate,migrate:migrate,patchValid:patchValid,apply:apply,reconcile:reconcile,stages:stages};
})();
