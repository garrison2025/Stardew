#!/usr/bin/env python3
"""Check explicit GEO page evidence in built HTML; not an AI ranking/crawler test."""
import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, urljoin


def normalized(s):
    return " ".join(s.split()).casefold()


def required_text(value):
    return isinstance(value, str) and bool(value.strip()) and "replace_me" not in value.casefold()


def confined(root, relative):
    if not required_text(relative) or Path(relative).is_absolute():
        raise ValueError("Expected a real relative artifact path")
    path = (root / relative).resolve()
    if not path.is_relative_to(root):
        raise ValueError("Artifact escapes site directory")
    return path


def valid_url(url):
    if not isinstance(url, str) or any(c.isspace() for c in url):
        return False
    try:
        p = urlsplit(url)
        return p.scheme in {"http", "https"} and bool(p.hostname) and not p.username and not p.password
    except ValueError:
        return False


class Page(HTMLParser):
    VOID = set("area base br col embed hr img input link meta param source track wbr".split())
    SKIP = {"head", "script", "style", "template", "noscript", "svg", "iframe", "dialog"}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.text = []
        self.links = []
        self.canonicals = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        parent_hidden = any(h for _, h in self.stack)
        hidden = (parent_hidden or tag in self.SKIP or "hidden" in a or "inert" in a
                  or (a.get("aria-hidden") or "").lower() == "true"
                  or bool(re.search(r"(display\s*:\s*none|visibility\s*:\s*hidden)", a.get("style") or "", re.I)))
        if tag == "link" and "canonical" in (a.get("rel") or "").lower().split():
            self.canonicals.append(a.get("href", ""))
        if tag == "a" and not hidden and a.get("href"):
            self.links.append(a["href"])
        if tag not in self.VOID:
            self.stack.append((tag, hidden))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack)-1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        if not any(h for _, h in self.stack):
            self.text.append(data)


def local_exists(root, url, origin):
    p = urlsplit(url)
    if (p.scheme, p.netloc) != (urlsplit(origin).scheme, urlsplit(origin).netloc):
        return None
    path = p.path.lstrip("/")
    candidates = [path or "index.html", path.rstrip("/") + "/index.html" if path else "index.html"]
    if path and not path.endswith("/") and not Path(path).suffix:
        candidates.append(path + ".html")
    return any(confined(root, candidate).is_file() for candidate in candidates)


def audit(root, config, origin):
    root = Path(root).resolve()
    checks = []
    def add(key, ok, detail):
        checks.append({"id": key, "status": "PASS" if ok else "FAIL", "detail": detail})
    try:
        if not root.is_dir() or not valid_url(origin) or urlsplit(origin).path not in ("", "/"):
            raise ValueError("A real built directory and HTTP(S) origin are required")
        origin = origin.rstrip("/")
        if not isinstance(config, dict) or config.get("version") != 1:
            raise ValueError("Expected version=1 GEO contract")
        for key in ("brand", "measurement_plan", "distribution_plan", "crawler_policy"):
            if not required_text(config.get(key)):
                raise ValueError("Missing project-specific " + key)
        routes = config.get("routes")
        if not isinstance(routes, list) or not routes:
            raise ValueError("At least one core route required")
        seen = set()
        for route in routes:
            if not isinstance(route, dict):
                raise ValueError("Invalid route object")
            url = route.get("route")
            if not isinstance(url, str) or not url.startswith("/") or url.startswith("//") or urlsplit(url).query or urlsplit(url).fragment or url in seen:
                raise ValueError("Unique canonical route paths required")
            seen.add(url)
            path = confined(root, route.get("html"))
            if not path.is_file():
                add(url, False, "Built HTML missing")
                continue
            page = Page()
            page.feed(path.read_text(encoding="utf8"))
            page.close()
            visible = normalized(" ".join(page.text))
            add(url + ":canonical", page.canonicals == [origin + url], "Exact production canonical")
            phrases = route.get("visible_phrases")
            if not isinstance(phrases, list) or not phrases or not all(required_text(x) for x in phrases):
                raise ValueError("Real answer/example snippets required for " + url)
            for i, phrase in enumerate([config["brand"], *phrases]):
                add(url + ":text:" + str(i), normalized(phrase) in visible, "Configured text in initial non-hidden HTML")
            assets = route.get("proof_assets")
            if not isinstance(assets, list) or not assets:
                raise ValueError("At least one proof asset or same-page evidence required")
            links = [urljoin(origin + url, link) for link in page.links]
            for i, asset in enumerate(assets):
                if not isinstance(asset, dict) or not all(required_text(asset.get(k)) for k in ("claim", "method", "source_version", "limitations", "license", "reproduction", "update_trigger", "visible_excerpt")):
                    raise ValueError("Proof asset provenance incomplete for " + url)
                target = asset.get("url")
                if not valid_url(target):
                    raise ValueError("Proof asset URL must be absolute HTTP(S)")
                excerpt_ok = normalized(asset["visible_excerpt"]) in visible
                linked = target == origin + url or target in links
                exists = local_exists(root, target, origin)
                add(url + ":proof:" + str(i), excerpt_ok and linked and exists is not False,
                    "Visible excerpt and linked/same-page proof; local file checked, external URL not fetched")
        rules = config.get("robots_directives")
        if not isinstance(rules, list) or not rules or not all(required_text(r) for r in rules):
            raise ValueError("Explicit robots directive expectations required")
        robots = confined(root, "robots.txt")
        if robots.is_file():
            actual = [normalized(x.split("#",1)[0]) for x in robots.read_text(encoding="utf8").splitlines() if x.split("#",1)[0].strip()]
            # Contiguous exact normalized directive blocks, not a robots parser.
            expected = [normalized(x) for x in rules]
            add("robots-configured-block", any(actual[i:i+len(expected)] == expected for i in range(len(actual))), "Expected contiguous robots directives; not effective bot permission")
        else:
            add("robots-configured-block", False, "robots.txt missing from built artifact")
        llms = config.get("llms_path")
        if llms is not None:
            p = confined(root, llms)
            add("llms-file", p.is_file(), "Optional configured documentation file")
            if p.is_file():
                targets = re.findall(r"\[[^\]]+\]\((https?://[^)\s]+)\)", p.read_text(encoding="utf8"))
                add("llms-links", bool(targets) and all(valid_url(t) and local_exists(root,t,origin) is not False for t in targets),
                    "Absolute Markdown links and local files; external availability untested")
    except (ValueError, TypeError, OSError, UnicodeError) as exc:
        add("contract", False, str(exc))
    return {"version": 1, "kind": "geo-offline", "status": "PASS" if checks and all(c["status"] == "PASS" for c in checks) else "FAIL",
            "checks": checks, "scope": "Configured evidence presence only. Human review, rendered visibility, live HTTP/CDN, AI citations and referrals not verified."}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--site-dir", type=Path, required=True)
    p.add_argument("--base-url", required=True)
    p.add_argument("--contract", type=Path, required=True)
    p.add_argument("--output", type=Path, required=True)
    args = p.parse_args()
    try:
        report = audit(args.site_dir, json.loads(args.contract.read_text(encoding="utf8")), args.base_url)
    except (OSError, ValueError) as exc:
        report = {"version":1,"kind":"geo-offline","status":"FAIL","checks":[{"id":"contract","status":"FAIL","detail":str(exc)}]}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2, ensure_ascii=False)+"\n",encoding="utf8")
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
