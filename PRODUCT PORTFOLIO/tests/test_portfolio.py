import copy,json,re,sqlite3,sys,unittest,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'workflow'))
from portfolio_status import migrate,merge_status,LEGACY
from build_portfolio import build

class PortfolioTests(unittest.TestCase):
 def setUp(self):
  self.data=json.loads((ROOT/'portfolio.json').read_text())
 def test_lossless_migration(self):
  original=json.loads(subprocess.check_output(['git','show','HEAD:PRODUCT PORTFOLIO/portfolio.json'],cwd=ROOT))
  migrated=migrate(original)
  self.assertEqual(migrated,migrate(migrated))
  self.assertEqual(32,len(migrated['products']))
  for old,new in zip(original['products'],migrated['products']):
   self.assertEqual(LEGACY.get(old['stage'],old['stage']),new['stage'])
   self.assertEqual({k:v for k,v in old.items() if k not in ('stage','publication')},{k:v for k,v in new.items() if k not in ('stage','publication')})
   if 'publication' not in old:self.assertEqual({'thangs':None,'makerworld':None},new['publication'])
 def test_reload_reconciliation_and_history(self):
  pid=self.data['products'][0]['product_id']
  changes={pid:{'publication':{'thangs':True,'makerworld':False},'updated_at':'2027-01-01T00:00:00Z'}}
  result=merge_status(self.data,self.data,changes)
  p=result['products'][0];self.assertEqual({'thangs':True,'makerworld':False},p['publication'])
  again=merge_status(self.data,result,changes)
  self.assertEqual(p['publication'],again['products'][0]['publication'])
  self.assertEqual(p['history'],again['products'][0]['history'])
  self.assertEqual(p['stage'],self.data['products'][0]['stage'])
  scan=copy.deepcopy(self.data);scan['products'][0]['stage']='published'
  again=merge_status(scan,result)
  self.assertEqual(p['publication'],again['products'][0]['publication'])
 def test_newer_platform_evidence_and_false(self):
  old=copy.deepcopy(self.data);p=old['products'][0];p['publication']={'thangs':True,'makerworld':False};p['publication_updated_at']={'thangs':'2026-01-01T02:00:00+02:00'}
  scan=copy.deepcopy(old);scan['products'][0]['publication']['thangs']=False;scan['products'][0]['publication_updated_at']['thangs']='2026-01-01T00:01:00Z'
  self.assertFalse(merge_status(scan,old)['products'][0]['publication']['thangs'])
 def test_assessments_and_snapshot(self):
  current=copy.deepcopy(self.data)
  for p in current['products']:
   for k in list(p):
    if k.startswith('assessment') or k in ('customer_interest_score','commercial_appeal_score','assessed_at'):p.pop(k)
  payload,html=build(current,self.data,{},(ROOT/'site/kanban/index.html').read_text())
  parsed=json.loads(payload)
  for a,b in zip(self.data['products'],parsed['products']):
   for k in a:
    if k.startswith('assessment') or k in ('customer_interest_score','commercial_appeal_score','assessed_at'):self.assertEqual(a[k],b[k])
  self.assertEqual(parsed,json.loads(re.search(r'type="application/json">(.*?)</script>',html,re.S)[1]))
 def test_sql_migration(self):
  con=sqlite3.connect(':memory:');con.executescript('CREATE TABLE products(product_id TEXT,stage TEXT);CREATE TABLE history(note TEXT);INSERT INTO products VALUES ("x","printed");INSERT INTO history VALUES ("original");')
  con.executescript((ROOT/'backend/migrations/0002_status_publication.sql').read_text())
  self.assertEqual(('to_publish',None,None),con.execute('SELECT stage,publication_thangs,publication_makerworld FROM products').fetchone())
  self.assertEqual(('original',),con.execute('SELECT note FROM history').fetchone())
 def test_stage_conflict_and_membership(self):
  old=copy.deepcopy(self.data);p=old['products'][0];p['stage']='to_publish';p['last_update_source']='dashboard';p['updated_at']='2027-01-01T00:00:00Z'
  self.assertEqual('to_publish',merge_status(self.data,old)['products'][0]['stage'])
  scan=copy.deepcopy(self.data);scan['products'][0]['location']='GPT-WORK/PUBLISHED/Product'
  self.assertEqual('published',merge_status(scan,old)['products'][0]['stage'])
  scan['products']=scan['products'][:1]
  self.assertEqual(1,len(merge_status(scan,old)['products']))
 def test_new_product_missing_assessment(self):
  current=copy.deepcopy(self.data);current['products'].append({'product_id':'new','stage':'idea'})
  with self.assertRaises(ValueError):build(current,self.data,{},(ROOT/'site/kanban/index.html').read_text())
  payload,_=build(current,self.data,{'new':{'seasonality':'year_round','customer_interest_score':0,'commercial_appeal_score':0}},(ROOT/'site/kanban/index.html').read_text())
  self.assertEqual(0,json.loads(payload)['products'][-1]['customer_interest_score'])
 def test_unknown_stage_rejected(self):
  self.data['products'][0]['stage']='typo'
  with self.assertRaises(ValueError):migrate(self.data)

if __name__=='__main__':unittest.main()
