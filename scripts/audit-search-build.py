"""Apply the Website Starter Standard scanners to Stardew build artifacts."""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from geo_audit import audit as audit_geo
from seo_audit import audit as audit_seo


def read_config(name):
    return json.loads((ROOT / "src/config" / name).read_text(encoding="utf-8"))


def write_report(output, name, report):
    (output / name).write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def geo_contract(pages, guides, evidence, references, release):
    core_slugs = {page["slug"] for page in pages}
    if set(guides) != core_slugs or set(evidence["tools"]) != core_slugs:
        raise ValueError("Every core route needs a guide and evidence")
    if evidence["referenceVersion"] != references["gameVersion"]:
        raise ValueError("Visible reference version differs from the reference manifest")
    registry = {entry["path"]: entry for entry in references["features"]}
    routes = []
    for page in pages:
        slug, route = page["slug"], page["path"]
        guide, proof = guides[slug], evidence["tools"][slug]
        reference = registry[route]
        sources = proof["sources"]
        if not sources or any(source["url"] not in reference["sources"] for source in sources):
            raise ValueError(f"{route} needs a game source from the reference manifest")
        routes.append({
            "route": route,
            "html": slug + "/index.html" if slug else "index.html",
            "visible_phrases": [
                page["guideText"], guide["example"], proof["limitations"],
                "Tool reference: Stardew Valley " + evidence["referenceVersion"],
            ],
            "proof_assets": [{
                "url": source["url"],
                "claim": guide["example"],
                "method": "Field & Farm worked example using documented reference rules.",
                "source_version": evidence["referenceVersion"],
                "limitations": proof["limitations"],
                "license": "External reference link; rights status tracked in reference manifest.",
                "reproduction": guide["example"],
                "update_trigger": "Game patch, source change or change to tool behavior.",
                "visible_excerpt": source["label"],
            } for source in sources],
        })
    return {
        "version": 1,
        "brand": release["brand"],
        "measurement_plan": "See docs/SEO-GEO.md, Search and AI measurement.",
        "distribution_plan": "See docs/SEO-GEO.md, Distribution.",
        "crawler_policy": "Allow public production crawling. Keep Preview and Workspace blocked.",
        "robots_directives": ["User-agent: *", "Allow: /"],
        "routes": routes,
        "llms_path": None,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--site-dir", type=Path, required=True)
    parser.add_argument("--origin", required=True)
    parser.add_argument("--mode", choices=["preview", "production"], required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if not args.site_dir.is_dir():
        parser.error("No built site at --site-dir")
    args.origin = args.origin.rstrip("/")
    pages = read_config("pages.json")
    paths = [page["path"] for page in pages]
    if args.mode == "preview":
        policy = {
            "mode": "preview",
            "preview_noindex_via": "meta",
            "required_routes": paths,
        }
    else:
        policy = {"mode": "production", "indexable_routes": paths}
    args.output.mkdir(parents=True, exist_ok=True)
    seo = audit_seo(args.site_dir, args.origin, policy)
    write_report(args.output, "seo.json", seo)
    print(f"{args.mode}: SEO scanned {seo['pages_scanned']} HTML files: {seo['summary']}")
    errors = [finding for finding in seo["findings"] if finding["severity"] == "error"]
    for finding in errors:
        print(finding)
    if args.mode == "preview":
        return bool(errors)

    contract = geo_contract(
        pages, read_config("tool-guides.json"), read_config("tool-evidence.json"),
        read_config("reference-manifest.json"), read_config("release.json"),
    )
    write_report(args.output, "geo-contract.json", contract)
    geo = audit_geo(args.site_dir, contract, args.origin)
    write_report(args.output, "geo.json", geo)
    print(f"production: GEO {geo['status']} across {len(contract['routes'])} core routes")
    for check in geo["checks"]:
        if check["status"] != "PASS":
            print(check)
    return bool(errors) or geo["status"] != "PASS"


if __name__ == "__main__":
    raise SystemExit(main())
