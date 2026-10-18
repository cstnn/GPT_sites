/** Server-only Google Drive access. No tokens or private portfolio in HTML. */
function owner_() {
  var props = PropertiesService.getScriptProperties();
  var expected = props.getProperty('OWNER_EMAIL');
  var active = Session.getActiveUser().getEmail();
  var effective = Session.getEffectiveUser().getEmail();
  if (!expected || !active || active.toLowerCase() !== expected.toLowerCase() || effective.toLowerCase() !== expected.toLowerCase()) throw new Error('UNAUTHORIZED: Sign in with the configured owner account.');
  return active;
}
function file_() {
  var id = PropertiesService.getScriptProperties().getProperty('PORTFOLIO_FILE_ID');
  if (!id) throw new Error('PORTFOLIO_FILE_ID is not configured.');
  var file = DriveApp.getFileById(id);
  if (file.getMimeType() !== 'application/json' && file.getMimeType() !== 'text/plain') throw new Error('The configured file must be a JSON file.');
  return file;
}
function hash_(text) { return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,text,Utilities.Charset.UTF_8)); }
function read_() {
  var file = file_(), raw = file.getBlob().getDataAsString('UTF-8');
  var data = PortfolioModel.validate(JSON.parse(raw));
  return {file:file,raw:raw,portfolio:data,revision:hash_(raw)};
}
function result_(state) { return {portfolio:state.portfolio,revision:state.revision}; }
function locked_(callback) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) throw new Error('BUSY: Another save is running. Try again.');
  try { return callback(); } finally { lock.releaseLock(); }
}
function write_(current, next) {
  if (read_().revision !== current.revision) throw new Error('CONFLICT: Drive changed. Reload and review your changes.');
  var raw = JSON.stringify(next,null,2)+'\n';
  current.file.setContent(raw);
  var verified = read_();
  if (verified.raw !== raw) throw new Error('SAVE_UNVERIFIED: Reload Drive before retrying. Your local draft is retained.');
  return result_(verified);
}
function doGet(e) {
  owner_(); var page = e && e.parameter.page === 'kanban' ? 'Board' : 'Index';
  var template = HtmlService.createTemplateFromFile(page);
  template.appUrl = ScriptApp.getService().getUrl();
  template.productId = e && e.parameter.product || '';
  template.capture = e && e.parameter.capture === '1';
  return template.evaluate().setTitle('NORHOLM Studio · '+(page==='Board'?'Kanban':'Product Hub')).addMetaTag('viewport','width=device-width,initial-scale=1');
}
function getPortfolio() { owner_(); return result_(read_()); }
function saveProduct(request) {
  var actor = owner_();
  if (!request || typeof request.productId !== 'string' || typeof request.revision !== 'string' || typeof request.requestId !== 'string' || request.requestId.length > 100) throw new Error('Invalid save request.');
  return locked_(function () {
    var current = read_();
    if ((current.portfolio.hub_operations || []).includes(request.requestId)) return result_(current);
    if (current.revision !== request.revision) throw new Error('CONFLICT: Another tab or workflow changed the portfolio. Reload and review before saving.');
    var next = PortfolioModel.apply(current.portfolio,request.productId,request.patch,actor,new Date().toISOString());
    next.hub_operations = (next.hub_operations || []).concat(request.requestId).slice(-100);
    return write_(current,next);
  });
}
function initializePortfolio() {
  var actor = owner_();
  return locked_(function () {
    var current = read_();
    if (current.portfolio.schema_version === 4) return {alreadyMigrated:true};
    var baseline = publishedBaseline_();
    var ids = current.portfolio.products.map(function(p){return p.product_id;}).sort();
    if (JSON.stringify(ids) !== JSON.stringify(baseline.products.map(function(p){return p.product_id;}).sort())) throw new Error('Membership differs from the reviewed migration. Review before upgrading.');
    var next = PortfolioModel.migrate(current.portfolio,baseline);
    next.hub_history = (next.hub_history || []).concat({at:new Date().toISOString(),actor:actor,source:'schema_migration',from:3,to:4,note:'Explicit migration preserving published marketplace decisions'});
    var parents = current.file.getParents();
    if (!parents.hasNext()) throw new Error('Portfolio folder not found.');
    var backup = current.file.makeCopy('portfolio.before-hub.'+new Date().toISOString().replace(/[:.]/g,'-')+'.json',parents.next());
    PropertiesService.getScriptProperties().setProperty('MIGRATION_BACKUP_ID',backup.getId());
    write_(current,next);
    return {migrated:true,backupId:backup.getId(),products:next.products.length};
  });
}
function createIdea(request) {
  var actor = owner_();
  if (!request || !/^draft:[0-9a-f-]{36}$/.test(request.productId) || typeof request.revision !== 'string') throw new Error('Invalid idea ID.');
  PortfolioModel.patchValid({product_name:request.name,description:request.description || ''});
  if (request.image && (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(request.image) || request.image.length > 1450000)) throw new Error('Invalid concept image.');
  return locked_(function () {
    var current = read_();
    if (current.portfolio.schema_version !== 4) throw new Error('MIGRATION_REQUIRED');
    if (current.portfolio.products.some(function(p){return p.product_id === request.productId;})) return result_(current);
    if (current.revision !== request.revision) throw new Error('CONFLICT: Reload before creating this idea.');
    var props = PropertiesService.getScriptProperties(), key = 'pending_'+request.productId;
    var pending = props.getProperty(key), folder;
    if (pending) folder = DriveApp.getFolderById(pending);
    else {
      var root = DriveApp.getFolderById(current.portfolio.root_folder_id), ideas = root.getFoldersByName('IDEAS');
      if (!ideas.hasNext()) throw new Error('IDEAS folder is unavailable. Idea kept as a local draft.');
      var parent = ideas.next(); if (ideas.hasNext()) throw new Error('Multiple IDEAS folders require review.');
      folder = parent.createFolder(request.name.trim()); props.setProperty(key,folder.getId());
    }
    var at = new Date().toISOString(), product = {product_id:request.productId,product_name:request.name.trim(),description:request.description || '',stage:'idea',folder_id:folder.getId(),folder_url:folder.getUrl(),location:'GPT-WORK/IDEAS/'+folder.getName(),publication:{thangs:null,makerworld:null},next_action:'Develop concept and specifications',created_at:at,updated_at:at,last_update_source:'dashboard',history:[{at:at,source:'dashboard',actor:actor,field:'product',from:null,to:'created',note:'Idea and Drive folder created from NORHOLM Studio'}]};
    if (request.image) {
      var imageFile, existing = folder.getFilesByName('concept.'+request.image.match(/^data:image\/(\w+)/)[1]);
      if (existing.hasNext()) imageFile = existing.next();
      else { var mime = request.image.slice(5,request.image.indexOf(';')), extension = mime.split('/')[1]; imageFile = folder.createFile(Utilities.newBlob(Utilities.base64Decode(request.image.split(',')[1]),mime,'concept.'+extension)); }
      product.hero_asset_id = imageFile.getId(); product.hero_asset_url = 'https://drive.google.com/thumbnail?id='+imageFile.getId()+'&sz=w1000'; product.hero_kind = 'concept';
    }
    var next = JSON.parse(JSON.stringify(current.portfolio)); next.products.push(product); next.generated_at = at;
    var result = write_(current,next); props.deleteProperty(key); return result;
  });
}
function reconcilePortfolio(request) {
  var actor = owner_();
  return locked_(function () {
    var current = read_();
    if (!request || request.revision !== current.revision) throw new Error('CONFLICT: Read the latest portfolio before reconciling.');
    var next = PortfolioModel.reconcile(current.portfolio,request.scan,actor,new Date().toISOString());
    return write_(current,next);
  });
}
function installWorkflowContract() {
  owner_();
  return locked_(function () {
    var props = PropertiesService.getScriptProperties(), id = props.getProperty('WORKFLOW_SKILL_FILE_ID');
    if (!id) throw new Error('Configure WORKFLOW_SKILL_FILE_ID first.');
    var skill = DriveApp.getFileById(id), original = skill.getBlob().getDataAsString('UTF-8');
    var marker = '\n## NORHOLM Google Hub — active portfolio writer contract';
    if (original.indexOf(marker) !== -1) return {alreadyInstalled:true};
    var parents = skill.getParents(); if (!parents.hasNext()) throw new Error('Skill parent unavailable.');
    var backup = skill.makeCopy('portfolio-workflow.before-drive-hub.'+new Date().toISOString().replace(/[:.]/g,'-')+'.md',parents.next());
    var contract = marker+'\nThis section supersedes earlier direct-write instructions for portfolio.json after private Hub activation. Use '+ScriptApp.getService().getUrl()+' as the owner-only Hub. The configured Drive portfolio is canonical; do not trash, recreate or directly overwrite it. Read getPortfolio (including its revision), perform a complete recursive GPT-WORK scan, and submit the scan through reconcilePortfolio in this same Apps Script project. On conflict, reload and review. Preserve schema-4 keys idea/specs_ready/3mf_ready/print_ready/to_publish/published, manually edited fields, scores/history and independent MakerWorld/Thangs decisions. Match stable product_id or folder_id so new Hub ideas keep their original ID. Partial scans never delete products. Assets and product control files remain directly editable in Drive. A public GitHub JSON is only a compatibility export, never the current mutable input. Script locks cannot protect against independent direct Drive writers; all portfolio writes must follow this contract.\n';
    skill.setContent(original+contract);
    if(skill.getBlob().getDataAsString('UTF-8')!==original+contract)throw new Error('Workflow update could not be verified.');
    return {updated:true,backupId:backup.getId()};
  });
}
function previewReconciliation(request) {
  var actor = owner_(), current = read_();
  if(!request || request.revision!==current.revision)throw new Error('CONFLICT: Reload before reviewing the scan.');
  var next = PortfolioModel.reconcile(current.portfolio,request.scan,actor,new Date().toISOString());
  var nextIds = new Set(next.products.map(function(p){return p.product_id;}));
  return {revision:current.revision,products:next.products.length,removed:current.portfolio.products.filter(function(p){return !nextIds.has(p.product_id);}).map(function(p){return {id:p.product_id,name:p.product_name};})};
}
