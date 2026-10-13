"""Preserve saved assessments; apply evidence-based proposals only to missing fields."""
import copy
import math

FIELDS = ("seasonality", "seasons", "customer_interest_score", "commercial_appeal_score",
          "assessment_rationale", "assessment_confidence", "assessed_at", "assessment_method",
          "assessment_evidence")

def valid_score(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) and 0 <= value <= 10

def merge_assessments(products, previous, proposals):
    saved = {p["product_id"]: p for p in previous}
    missing = []
    for product in products:
        pid = product["product_id"]
        old = saved.get(pid, {})
        proposal = proposals.get(pid, {})
        for field in FIELDS:
            def valid(value):
                if field.endswith("_score"):
                    return valid_score(value)
                if field == "seasonality":
                    return value in ("seasonal", "year_round")
                return value is not None and value != ""
            if valid(old.get(field)):
                product[field] = copy.deepcopy(old[field])
            elif valid(product.get(field)):
                continue
            elif valid(proposal.get(field)):
                product[field] = copy.deepcopy(proposal[field])
        needed = [f for f in ("seasonality", "customer_interest_score", "commercial_appeal_score")
                  if f not in product or (f.endswith("_score") and not valid_score(product[f]))]
        if needed:
            missing.append({"product_id": pid, "missing_fields": needed})
    return missing

if __name__ == "__main__":
    import argparse, json
    from pathlib import Path
    parser = argparse.ArgumentParser()
    parser.add_argument("--portfolio", required=True)
    parser.add_argument("--previous", required=True)
    parser.add_argument("--proposals", required=True)
    args = parser.parse_args()
    path = Path(args.portfolio)
    current = json.loads(path.read_text())
    previous = json.loads(Path(args.previous).read_text())
    proposals = json.loads(Path(args.proposals).read_text())
    missing = merge_assessments(current["products"], previous["products"], proposals)
    current["schema_version"] = 3
    path.write_text(json.dumps(current, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"missing_assessments": missing}))
