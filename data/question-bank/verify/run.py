#!/usr/bin/env python3
"""
Run every registered verification check against the question-bank JSON files.

Usage:
  python3 data/question-bank/verify/run.py            # report only
  python3 data/question-bank/verify/run.py --write    # also record results in the JSON files
  python3 data/question-bank/verify/run.py --subject hge
Exit code 1 if any computational question fails or lacks a check.
"""
from __future__ import annotations

import argparse
import datetime as dt
import importlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
BANK = HERE.parent
sys.path.insert(0, str(HERE))

from harness import REGISTRY, close  # noqa: E402

FILES = {
    "mste": "mathematics-surveying-transportation.json",
    "hge": "hydraulics-geotechnical.json",
    "psad": "structural-analysis-design.json",
}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--subject", choices=list(FILES))
    args = ap.parse_args()

    now = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    report = {"generatedAt": now, "results": [], "summary": {}}
    failures = 0

    for subject, fname in FILES.items():
        if args.subject and subject != args.subject:
            continue
        path = BANK / fname
        if not path.exists():
            print(f"[skip] {fname} not found")
            continue
        importlib.import_module(subject)
        data = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        for q in data["questions"]:
            qid = q["id"]
            entry = {"id": qid, "subject": subject, "type": q["type"]}
            if q["type"] != "computational":
                entry.update(status="needs-human-review", detail="conceptual question: no deterministic check")
                report["results"].append(entry)
                continue
            chk = REGISTRY.get(qid)
            if chk is None:
                entry.update(status="failed", detail="no verification function registered")
                failures += 1
                report["results"].append(entry)
                if args.write:
                    q["verification"].update(status="failed", checkedAt=now, notes="no verification function registered")
                    changed = True
                continue
            problems = []
            try:
                value = float(chk.fn())
            except Exception as exc:  # noqa: BLE001
                value = float("nan")
                problems.append(f"check raised {exc!r}")
            choices = {c["key"]: c for c in q["choices"]}
            keyed = choices.get(q["answer"])
            if keyed is None or "value" not in keyed:
                problems.append("keyed choice has no numeric value")
            elif not close(value, keyed["value"], chk.tol):
                problems.append(f"computed {value:.6g} != keyed {q['answer']}={keyed['value']}")
            matches = [k for k, c in choices.items() if "value" in c and close(value, c["value"], chk.tol)]
            if len(matches) != 1:
                problems.append(f"{len(matches)} choices match the computed value: {matches}")
            vals = [c.get("value") for c in q["choices"]]
            for i in range(4):
                for j in range(i + 1, 4):
                    if vals[i] is not None and vals[j] is not None and close(vals[i], vals[j], chk.tol):
                        problems.append(f"choices {q['choices'][i]['key']} and {q['choices'][j]['key']} are numerically indistinguishable")
            declared_unit = q["verification"].get("unit")
            if declared_unit and chk.unit and declared_unit != chk.unit:
                problems.append(f"unit mismatch: json {declared_unit!r} vs check {chk.unit!r}")
            status = "passed" if not problems else "failed"
            if problems:
                failures += 1
            entry.update(status=status, computed=value, unit=chk.unit, tol=chk.tol, detail="; ".join(problems))
            report["results"].append(entry)
            if args.write:
                q["verification"].update(
                    method="python-recompute",
                    script=f"verify/{subject}.py::{chk.fn.__name__}",
                    computedValue=round(value, 10),
                    unit=chk.unit,
                    tolerance=chk.tol,
                    status=status,
                    checkedAt=now,
                )
                if problems:
                    q["verification"]["notes"] = "; ".join(problems)
                else:
                    q["verification"].pop("notes", None)
                changed = True
        orphan = [k for k in REGISTRY if k.startswith(subject + "-") and k not in {q["id"] for q in data["questions"]}]
        for k in orphan:
            report["results"].append({"id": k, "subject": subject, "status": "failed", "detail": "check registered for unknown question"})
            failures += 1
        if args.write and changed:
            path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    counts = {}
    for r in report["results"]:
        counts[r["status"]] = counts.get(r["status"], 0) + 1
    report["summary"] = counts
    (BANK / "reports").mkdir(exist_ok=True)
    (BANK / "reports" / "verification-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    for r in report["results"]:
        if r["status"] == "failed":
            print(f"FAIL {r['id']}: {r['detail']}")
    print("summary:", counts)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
