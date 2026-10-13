"""Finalize a reconciled portfolio and regenerate the board from its existing template."""
import argparse,json,re
from pathlib import Path
from portfolio_assessments import merge_assessments

def build(current, previous, proposals, template):
    missing=merge_assessments(current['products'],previous['products'],proposals)
    if missing:
        raise ValueError('Review images/specs and provide missing assessments: '+json.dumps(missing))
    current['schema_version']=3
    payload=json.dumps(current,ensure_ascii=False,indent=2)+'\n'
    pattern=r'(<script id="portfolio-snapshot" type="application/json">).*?(</script>)'
    html,count=re.subn(pattern,lambda m:m[1]+payload.replace('</','<\\/')+m[2],template,flags=re.S)
    if count!=1:raise ValueError('Expected exactly one portfolio snapshot in template')
    if 'function assessment(p)' not in html:raise ValueError('Use the current assessment-enabled HTML template')
    return payload,html

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    for arg in ('current','previous','template','output_json','output_html'):parser.add_argument('--'+arg.replace('_','-'),required=True)
    parser.add_argument('--proposals')
    a=parser.parse_args()
    proposals=json.loads(Path(a.proposals).read_text()) if a.proposals else {}
    payload,html=build(json.loads(Path(a.current).read_text()),json.loads(Path(a.previous).read_text()),proposals,Path(a.template).read_text())
    Path(a.output_json).write_text(payload);Path(a.output_html).write_text(html)
