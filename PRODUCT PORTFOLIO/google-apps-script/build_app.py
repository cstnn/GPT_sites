"""Package existing Hub and Kanban as a private Apps Script app, without changing Pages."""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HERE = Path(__file__).resolve().parent


def inline_script(source):
    return '<script>\n'+source.replace('</script','<\\/script')+'\n</script>'


def package(output, file_id=None, owner=None):
    output.mkdir(parents=True, exist_ok=True)
    model=(HERE/'Model.gs').read_text()
    server=(HERE/'Code.gs').read_text()
    baseline=(ROOT/'portfolio.json').read_text()
    setup=''
    if file_id and owner:
        setup='\nfunction configureOwner_(){PropertiesService.getScriptProperties().setProperties('+json.dumps({'PORTFOLIO_FILE_ID':file_id,'OWNER_EMAIL':owner})+');}\n'
    (output/'Code.gs').write_text(model+'\n'+server+'\nfunction publishedBaseline_(){return '+baseline+';}\n'+setup)
    (output/'appsscript.json').write_text((HERE/'appsscript.json').read_text())
    (output/'Index.html').write_text(build_page('index.html',False))
    (output/'Board.html').write_text(build_page('kanban/index.html',True))


def build_page(path, board):
    html=(ROOT/'site'/path).read_text()
    html=re.sub(r'<script id="portfolio-snapshot".*?</script>','',html,flags=re.S)
    html=re.sub(r'<link rel="stylesheet" href="(?:\.\./)?assets/([^"/]+)">',lambda m:'<style>'+ (ROOT/'site/assets'/m[1]).read_text()+'</style>',html)
    # Remove deferred scripts; insert shared dependencies after the body exists.
    html=re.sub(r'<script(?: defer)? src="(?:\.\./)?assets/(chrome|store|hub)\.js"></script>','',html)
    bootstrap='<script>window.HUB_APP_URL=<?!= JSON.stringify(appUrl).replace(/</g,"\\\\u003c") ?>;window.HUB_PRODUCT_ID=<?!= JSON.stringify(productId).replace(/</g,"\\\\u003c") ?>;window.HUB_CAPTURE=<?!= capture ? "true" : "false" ?>;</script>'
    chrome=(ROOT/'site/assets/chrome.js').read_text().replace("new URL('../index.html', document.currentScript.src).href", "HubDrive.url('products')").replace("new URL('kanban/index.html', home).href", "HubDrive.url('kanban')").replace('${home}?capture=1','${home}&capture=1').replace('<a ', '<a target="_top" ')
    shared=bootstrap+inline_script((ROOT/'site/assets/store.js').read_text())+inline_script((HERE/'bridge.js').read_text())+inline_script(chrome)
    html=html.replace('<body data-page="'+('kanban' if board else 'products')+'">','<body data-page="'+('kanban' if board else 'products')+'">')
    # chrome needs its placeholders and controls in the DOM before execution.
    if board:
        start=html.index('<script>\nconst stages=')
        html=html[:start]+shared+html[start:]
        html=html.replace("let data=JSON.parse(document.getElementById('portfolio-snapshot').textContent);", "let data={products:[]};")
        html=html.replace('function setStage(id,stage)', 'async function setStage(id,stage)').replace('function setPublication(id,platform,value)', 'async function setPublication(id,platform,value)')
        html=html.replace('HubStore.change(effective(p),{stage});render()', 'await HubDrive.save(effective(p),{stage},HubDrive.revision);data=HubDrive.snapshot;render()')
        html=html.replace('HubStore.change(effective(p),{publication:{[platform]:value}});render()', 'await HubDrive.save(effective(p),{publication:{[platform]:value}},HubDrive.revision);data=HubDrive.snapshot;render()')
        html=html.replace('href="../index.html#${encodeURIComponent(p.product_id)}"','target="_top" href="${HubDrive.url(\'products\',p.product_id)}"')
        a=html.index("document.getElementById('stamp').textContent='Synced dataset:")
        b=html.index('</script>',a)
        html=html[:a]+"HubDrive.load().then(j=>{data=j;document.getElementById('stamp').textContent='Connected to Drive · refreshed '+new Date().toLocaleString();render()}).catch(e=>{document.getElementById('stamp').textContent=e.message});\nwindow.addEventListener('storage',render);\n"+html[b:]
        html=html.replace('Changes save immediately in this browser.', 'Stage and marketplace changes save to your Drive portfolio. A failed save is retained as a local draft; reload and review any conflict before retrying.')
    else:
        script=(ROOT/'site/assets/hub.js').read_text()
        script=script.replace("function run(fn){try{return fn()}catch(e){alert(e.message);return null}}", "function run(fn){try{return Promise.resolve(fn()).catch(e=>{alert(e.message);return null})}catch(e){alert(e.message);return null}}")
        script=script.replace('Save local changes','Save to Drive').replace('Saved only on this device. Export a backup before clearing browser data.', 'Save writes to your private Drive portfolio. If it fails, your changes remain as a local draft.')
        script=script.replace('PRODUCT WORKSPACE · LOCAL DRAFT MODE','PRODUCT WORKSPACE · GOOGLE DRIVE')
        script=script.replace('function detail(){const p=', 'function detail(){const editRevision=HubDrive.revision;const p=')
        script=script.replace('run(()=>{const f=new FormData(form)', 'run(async()=>{const f=new FormData(form)')
        script=script.replace('S.change(p,patch);render();detail();', 'await HubDrive.save(p,patch,editRevision);snapshot=HubDrive.snapshot;render();detail();')
        script=script.replace('Saved on this device. Export backup for transfer.', 'Saved to Drive and verified.')
        script=script.replace("run(()=>{S.change(p,{tasks:","run(async()=>{await HubDrive.save(p,{tasks:")
        script=script.replace("id:crypto.randomUUID()}]});detail();render()", "id:crypto.randomUUID()}]},editRevision);snapshot=HubDrive.snapshot;detail();render()")
        script=script.replace("c.onchange=()=>run(()=>{S.change(p,{tasks:", "c.onchange=()=>run(async()=>{await HubDrive.save(p,{tasks:")
        script=script.replace("{...t,done:c.checked}:t)});detail()", "{...t,done:c.checked}:t)},editRevision);snapshot=HubDrive.snapshot;detail()")
        script=script.replace("if(new URLSearchParams(location.search).get('capture')==='1')", "if(window.HUB_CAPTURE)")
        script=script.replace('run(()=>{const p=S.create', 'run(async()=>{const p=S.create')
        script=script.replace("$('idea').close();e.target.reset();render();open(p.product_id);notify('Idea saved locally. Export a backup to keep a portable copy.')", "$('idea').close();e.target.reset();try{snapshot=await HubDrive.create(p);notify('Idea and folder saved to Drive.')}catch(error){notify(error.message)}render();open(p.product_id)")
        script=script.replace("let body='';", "let body='';")
        script=script.replace("if(tab==='Overview')body=", "if(tab==='Overview')body=")
        script=script.replace('<p id="saved" role="status"></p>`;', '<p id="saved" role="status"></p>${p.draft?\'<button id="pushidea">Create Drive folder and save idea</button>\':\'\'}`;\nif($(\'pushidea\'))$(\'pushidea\').onclick=()=>run(async()=>{snapshot=await HubDrive.create(p);render();detail()});')
        a=script.index("fetch('../portfolio.json'")
        script=script[:a]+"HubDrive.load().then(j=>{snapshot=j;$('sync').textContent='Connected to your private Drive portfolio · refreshed '+new Date().toLocaleString()+'. Save writes to Drive; failed saves remain as local drafts.';render();const id=window.HUB_PRODUCT_ID;if(id&&all().some(p=>p.product_id===id))open(id)}).catch(e=>{$('sync').textContent=e.message;notify('Drive is unavailable. Existing browser drafts have not been cleared.')});\n"
        script += "\n$('scanimport').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5000000)throw Error('Scan too large.');if(all().some(p=>p.pending||p.draft))throw Error('Resolve or export pending local edits before importing a scan.');const scan=JSON.parse(await file.text());const preview=await HubDrive.previewScan(scan);if(confirm('Apply this complete scan? '+preview.products+' products remain. Removed: '+(preview.removed.map(p=>p.name).join(', ')||'none')+'. Source assets will not be deleted.')){snapshot=await HubDrive.reconcile(scan,preview.revision);render();notify('Complete scan merged into Drive and verified.')}}catch(error){notify(error.message)}e.target.value=''};\n"
        html=html.replace('<section id="products"', '<label class="small">Review complete Drive scan<input id="scanimport" type="file" accept="application/json"></label><section id="products"')
        html=html.replace('</body>',shared+inline_script(script)+'</body>')
        html=html.replace('Save an idea on this device. Drive folder creation awaits a protected connection.', 'Create an idea and its folder in Drive. A failed connection keeps the idea as a local draft.').replace('Save local idea','Save idea to Drive')
    return html


if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',required=True);p.add_argument('--file-id');p.add_argument('--owner');a=p.parse_args()
    package(Path(a.output),a.file_id,a.owner)
    print('Prepared private Apps Script package at '+a.output)
