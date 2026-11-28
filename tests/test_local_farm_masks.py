import importlib.util
from pathlib import Path
import unittest
spec = importlib.util.spec_from_file_location("compiler", Path(__file__).parents[1] / "scripts" / "extract-local-farm-masks.py")
compiler = importlib.util.module_from_spec(spec)
spec.loader.exec_module(compiler)

def fixture(back=None, buildings=None, overrides=""):
    back = back or [1] * 64
    buildings = buildings or [0] * 64
    return (f'<map orientation="orthogonal" width="8" height="8" tilewidth="16" tileheight="16">'
        '<tileset firstgid="1" tilecount="4"><tile id="0"><properties><property name="Diggable" value="T"/></properties></tile>'
        '<tile id="1"><properties><property name="Water" value="T"/></properties></tile>'
        '<tile id="2"><properties><property name="Buildable" value="T"/></properties></tile>'
        '<tile id="3"><properties><property name="Passable" value="T"/></properties></tile></tileset>'
        f'<layer name="Back" width="8" height="8"><data encoding="csv">{",".join(map(str,back))}</data></layer>'
        f'<layer name="Buildings" width="8" height="8"><data encoding="csv">{",".join(map(str,buildings))}</data></layer>'
        f'{overrides}</map>').encode()

class CompilerTests(unittest.TestCase):
    def test_property_rules(self):
        b = [1] * 64
        b[:4] = [2, 3, 1, 0]
        f = [0] * 64
        f[2] = 1
        mask, counts = compiler.compile_tmx(fixture(b, f), 8, 8)
        self.assertEqual(mask, "1h1e2h60a")
        self.assertEqual(counts, {"accessible": 61, "buildable": 61, "tillable": 60})

    def test_override_and_gid_flags(self):
        b = [1] * 64
        b[0] = 0x80000001
        o = '<objectgroup name="Back"><object name="TileData" x="0" y="0"><properties><property name="Buildable" value="F"/></properties></object></objectgroup>'
        mask, counts = compiler.compile_tmx(fixture(b, overrides=o), 8, 8)
        self.assertEqual(mask, "1c63a")
        self.assertEqual(counts["buildable"], 63)

    def test_fail_closed(self):
        for raw in [fixture()[:-1], fixture().replace(b'encoding="csv"', b'encoding="base64"'), fixture([1]*63), b'<!DOCTYPE map>' + fixture(), fixture().replace(b'firstgid="1"', b'firstgid="1" source="external.tsx"')]:
            with self.assertRaises((ValueError, compiler.ET.ParseError)):
                compiler.compile_tmx(raw, 8, 8)
    def test_eight_exact_frames(self):
        self.assertEqual(len(compiler.FARMS), 8)
        self.assertEqual(sum(w*h for _,_,w,h in compiler.FARMS), 52000)

if __name__ == "__main__":
    unittest.main()
