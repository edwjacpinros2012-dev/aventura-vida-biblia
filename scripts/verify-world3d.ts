import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
const world = read("components/creation-world.tsx");
const page = read("app/mundo-3d/page.tsx");
const pkg = read("package.json");
const registry = read("lib/games/registry.ts");

const checks: Array<[string, boolean]> = [
  ["Three.js React renderer is declared", pkg.includes('"@react-three/fiber"')],
  ["Drei helpers are declared", pkg.includes('"@react-three/drei"')],
  ["World page mounts the scene", page.includes("<CreationWorld")],
  ["World has keyboard and touch movement", world.includes("DirectionButton") && world.includes("pressedKeys.add(key)")],
  ["Jump physics is present", world.includes("jumpVelocity.current")],
  ["Light quest collectibles exist", world.includes("const lights =") && world.includes("collect(index)")],
  ["Wood and stone gathering exists", world.includes("woodNodes") && world.includes("stoneNodes") && world.includes("collectWood") && world.includes("collectStone")],
  ["Local resource inventory is persisted", world.includes("av-world-wood-inventory") && world.includes("av-world-stone-inventory")],
  ["Buildable cabin and lamp objects exist", world.includes('kind: "cabin" | "lamp"') && world.includes('build("cabin")') && world.includes('build("lamp")')],
  ["River uses reflective water material", world.includes("MeshReflectorMaterial") && world.includes("resolution={128}")],
  ["World minimap is rendered", world.includes("Mapa del valle") && world.includes("minimapPlayerMarker")],
  ["Minimap marker updates without React frame state", world.includes("minimapMarker.current.style.left") && world.includes("minimapMarker.current.style.top")],
  ["All fifteen game adapters remain registered", (registry.match(/^\s*(?:"[^"]+"|[a-z-]+): \{ key:/gm) ?? []).length === 15],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} — ${label}`);
if (failed.length) process.exitCode = 1;
else console.log(`\\nWorld prototype static verification passed (${checks.length} checks). This is not a browser/E2E test.`);
