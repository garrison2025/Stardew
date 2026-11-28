"""Local offline TMX property reference compiler. No art, network or game runtime."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET

FARMS = [
    ("standard", "Farm", 80, 65),
    ("riverland", "Farm_Fishing", 80, 65),
    ("forest", "Farm_Foraging", 80, 65),
    ("hill-top", "Farm_Mining", 80, 65),
    ("wilderness", "Farm_Combat", 80, 65),
    ("four-corners", "Farm_FourCorners", 80, 80),
    ("beach", "Farm_Island", 110, 110),
    ("meadowlands", "Farm_Ranching", 100, 75),
]
MAX_BYTES = 16 * 1024 * 1024

def integer(value, lo, hi):
    if value is None or not re.fullmatch(r"[0-9]+", value):
        raise ValueError("Expected unsigned integer")
    number = int(value)
    if not lo <= number <= hi:
        raise ValueError("Integer outside accepted range")
    return number

def properties(node):
    result = {}
    for child in node.findall("./properties/property"):
        key = child.get("name")
        if not key or key in result:
            raise ValueError("Invalid or duplicate property")
        result[key] = child.get("value", child.text or "")
    return result

def compile_tmx(raw, width, height):
    if len(raw) > MAX_BYTES or re.search(br"<!\s*(?:DOCTYPE|ENTITY)", raw, re.I):
        raise ValueError("Unsupported XML size or declaration")
    root = ET.fromstring(raw)
    if root.tag != "map" or root.get("orientation") != "orthogonal" or root.get("infinite", "0") != "0":
        raise ValueError("Expected finite orthogonal TMX")
    if (integer(root.get("width"), 8, 160), integer(root.get("height"), 8, 160)) != (width, height):
        raise ValueError("Unexpected vanilla map dimensions")
    if root.get("tilewidth") != "16" or root.get("tileheight") != "16":
        raise ValueError("Expected 16-pixel game tiles")
    sets = []
    for node in root.findall("tileset"):
        if node.get("source") is not None:
            raise ValueError("External TSX unsupported; use unpacked inline tilesets")
        first = integer(node.get("firstgid"), 1, 0x0fffffff)
        count = integer(node.get("tilecount"), 1, 0x0fffffff) if node.get("tilecount") else None
        lookup = {}
        for tile in node.findall("tile"):
            tid = integer(tile.get("id"), 0, 0x0fffffff)
            if tid in lookup or (count is not None and tid >= count):
                raise ValueError("Invalid tile ID")
            lookup[tid] = properties(tile)
        sets.append((first, count, lookup))
    sets.sort(reverse=True, key=lambda entry: entry[0])
    if not sets or len({entry[0] for entry in sets}) != len(sets):
        raise ValueError("Missing or duplicate tileset")
    layers = {}
    for layer in root.findall("layer"):
        name = layer.get("name")
        if name not in ("Back", "Buildings"):
            continue
        if name in layers or layer.get("offsetx", "0") != "0" or layer.get("offsety", "0") != "0":
            raise ValueError("Duplicate or shifted restriction layer")
        if (integer(layer.get("width"), 8, 160), integer(layer.get("height"), 8, 160)) != (width, height):
            raise ValueError("Layer dimensions differ")
        data = layer.find("data")
        if data is None or data.get("encoding") != "csv" or data.get("compression") or len(data):
            raise ValueError("Expected uncompressed CSV layer data")
        values = [integer(x.strip(), 0, 0xffffffff) for x in (data.text or "").split(",")]
        if len(values) != width * height:
            raise ValueError("Incomplete restriction layer")
        layers[name] = [x & 0x0fffffff for x in values]
    if set(layers) != {"Back", "Buildings"}:
        raise ValueError("Both Back and Buildings layers are required")
    overrides = {}
    for group in root.findall("objectgroup"):
        name = group.get("name")
        if name not in layers:
            continue
        for obj in group.findall("object"):
            if obj.get("name") != "TileData" and obj.get("type") != "TileData":
                continue
            x = integer(obj.get("x"), 0, width * 16 - 1) // 16
            y = integer(obj.get("y"), 0, height * 16 - 1) // 16
            key = (name, y * width + x)
            if key in overrides:
                raise ValueError("Duplicate tile-property override")
            overrides[key] = properties(obj)

    def tile(name, index):
        gid = layers[name][index]
        props = {}
        if gid:
            entry = next((entry for entry in sets if gid >= entry[0]), None)
            if entry is None:
                raise ValueError("Unknown global tile ID")
            first, count, lookup = entry
            if count is not None and gid - first >= count:
                raise ValueError("Tile ID outside tileset")
            props.update(lookup.get(gid - first, {}))
        props.update(overrides.get((name, index), {}))
        return gid, props

    def false(value):
        return value is not None and value.lower() in ("f", "false")
    def true(value):
        return value is not None and value.lower() in ("t", "true")

    cells = []
    for i in range(width * height):
        back_id, back = tile("Back", i)
        building_id, building = tile("Buildings", i)
        # Property-derived baseline, not an emulation of dynamic game placement.
        clear = bool(back_id) and "Water" not in back and not false(back.get("Passable"))
        clear = clear and (not building_id or "Passable" in building)
        till = clear and "Diggable" in back
        build = clear and not false(back.get("Buildable")) and (true(back.get("Buildable")) or till)
        cells.append((0 if clear else 1) | (0 if build else 2) | (0 if till else 4))
    runs = []
    previous = cells[0]
    count = 0
    for value in cells:
        if value != previous:
            runs.append(str(count) + chr(97 + previous))
            previous, count = value, 0
        count += 1
    runs.append(str(count) + chr(97 + previous))
    counts = {name: sum(not value & flag for value in cells)
              for name, flag in (("accessible", 1), ("buildable", 2), ("tillable", 4))}
    return "".join(runs), counts

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("content", type=Path, help="Local Content (unpacked) folder")
    parser.add_argument("output", type=Path, help="New empty output folder")
    parser.add_argument("version", help="Declared game version, not independently verified")
    args = parser.parse_args()
    if not re.fullmatch(r"1\.6\.\d+(?:\.\d+)?", args.version):
        raise ValueError("Declare a 1.6.x version")
    prepared = []
    for slug, name, w, h in FARMS:
        path = args.content / "Maps" / (name + ".tmx")
        if path.stat().st_size > MAX_BYTES:
            raise ValueError("TMX exceeds input size limit")
        raw = path.read_bytes()
        mask, counts = compile_tmx(raw, w, h)
        prepared.append((slug, mask, {"file": slug + ".txt", "width": w, "height": h,
            "sourceSha256": hashlib.sha256(raw).hexdigest(),
            "maskSha256": hashlib.sha256(mask.encode()).hexdigest(), "counts": counts}))
    args.output.mkdir(parents=True, exist_ok=True)
    if any(args.output.iterdir()):
        raise ValueError("Choose an empty output folder")
    for slug, mask, _ in prepared:
        with (args.output / (slug + ".txt")).open("x", encoding="ascii") as f:
            f.write(mask)
    manifest = {"schema": 1, "source": "local-tmx-property-reference",
        "declaredGameVersion": args.version, "versionVerified": False,
        "runtimeVerified": False, "rightsApproved": False, "releaseApproved": False,
        "maps": [row[2] for row in prepared]}
    with (args.output / "manifest.json").open("x", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print("Compiled eight local reference masks; 52,000 positions. No artwork or runtime parity claim.")

if __name__ == "__main__":
    main()
