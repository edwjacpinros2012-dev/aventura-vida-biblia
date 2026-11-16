import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");
const world = read("components/creation-world.tsx");
const page = read("app/mundo-3d/page.tsx");
const pkg = read("package.json");
const registry = read("lib/games/registry.ts");
const worldApi = read("app/api/world/state/route.ts");
const schema = read("prisma/schema.prisma");
const worldMigration = read("prisma/migrations/20261116153000_player_world_state/migration.sql");

const checks: Array<[string, boolean]> = [
  ["Three.js React renderer is declared", pkg.includes('"@react-three/fiber"')],
  ["Drei helpers are declared", pkg.includes('"@react-three/drei"')],
  ["World page mounts the scene", page.includes("<CreationWorld")],
  ["World has keyboard and touch movement", world.includes("DirectionButton") && world.includes("pressedKeys.add(key)")],
  ["Three named 3D NPCs are rendered in the world", world.includes("function WorldNpc(") && ["Guardián", "Jardinera", "Constructor"].every((name) => world.includes(`title="${name}"`))],
  ["NPCs face the player and animate idly", world.includes("root.current.rotation.y") && world.includes("state.clock.elapsedTime * 1.35")],
  ["NPCs have collision boundaries", world.includes("{ x: 2.6, z: 1, radius: 0.85 }") && world.includes("{ x: -7, z: 3, radius: 0.85 }") && world.includes("{ x: 8, z: 7, radius: 0.85 }")],
  ["Jump physics is present", world.includes("jumpVelocity.current")],
  ["Light quest collectibles exist", world.includes("const lights =") && world.includes("collect(index)")],
  ["Wood and stone gathering exists", world.includes("woodNodes") && world.includes("stoneNodes") && world.includes("collectWood") && world.includes("collectStone")],
  ["Local resource inventory is persisted", world.includes("av-world-wood-inventory") && world.includes("av-world-stone-inventory")],
  ["Authenticated world state loads from the server", world.includes('fetch("/api/world/state", { cache: "no-store" })')],
  ["World changes are saved to the account", world.includes('method: "PUT"') && world.includes("worldSaveQueue.current")],
  ["Build pieces are placed near the live player position", world.includes("playerPosition.current") && world.includes("const candidates = Array.from({ length: 12 }")],
  ["Build coordinates are validated and persisted", world.includes("x: x ??") && worldApi.includes("x: z.number().finite().min(-16).max(16).optional()")],
  ["World state API requires an authenticated account", worldApi.includes("accountFromRequest") && worldApi.includes("status: 401")],
  ["World state API validates unique resources and build costs", worldApi.includes("No se permiten recursos duplicados") && worldApi.includes("Las construcciones superan los materiales reunidos")],
  ["Prisma declares persistent player world state", schema.includes("model PlayerWorldState") && schema.includes("worldState PlayerWorldState?")],
  ["World state migration preserves user data and cascades account deletion", worldMigration.includes('CREATE TABLE "PlayerWorldState"') && worldMigration.includes("ON DELETE CASCADE")],
  ["Buildable cabin and lamp objects exist", world.includes('kind: "cabin" | "lamp"') && world.includes('build("cabin")') && world.includes('build("lamp")')],
  ["World obstacles block player movement", world.includes("collisionObstacles") && world.includes("isWorldBlocked")],
  ["River uses reflective water material", world.includes("MeshReflectorMaterial") && world.includes("resolution={128}")],
  ["The 2D billboard is replaced by a 3D humanoid model", !world.includes("planeGeometry args={[1.8, 2.9]}") && world.includes("<capsuleGeometry") && world.includes("sphereGeometry args={[0.43, 16, 12]}")],
  ["All six official avatar variants map to distinct 3D clothing palettes", ["vida-kids-01-rosa-morado", "vida-kids-02-blanco", "vida-kids-03-azul", "vida-kids-04-beige", "vida-kids-05-verde", "vida-kids-06-rojo"].every((key) => world.includes(`"${key}"`))],
  ["3D avatar limbs animate while moving", world.includes("leftArm.current.rotation.x") && world.includes("rightLeg.current.rotation.x") && world.includes("state.clock.elapsedTime * 10")],
  ["Store equipment attaches to 3D head, torso and back", world.includes('equippedSlugs.includes("yelmo-salvacion")') && world.includes('equippedSlugs.includes("tunica-pastor-amable")') && world.includes('equippedSlugs.includes("capa-bondad")')],
  ["World minimap is rendered", world.includes("Mapa del valle") && world.includes("minimapPlayerMarker")],
  ["Minimap marker updates without React frame state", world.includes("minimapMarker.current.style.left") && world.includes("minimapMarker.current.style.top")],
  ["All fifteen game adapters remain registered", (registry.match(/^\s*(?:"[^"]+"|[a-z-]+): \{ key:/gm) ?? []).length === 15],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} — ${label}`);
if (failed.length) process.exitCode = 1;
else console.log(`\\nWorld prototype static verification passed (${checks.length} checks). This is not a browser/E2E test.`);
