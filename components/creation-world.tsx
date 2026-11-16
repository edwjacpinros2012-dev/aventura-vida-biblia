"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sky, Sparkles } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const avatar = "/assets/proyecto-vida-kids/characters/vida-kids-01-rosa-morado/full.png";
const lights = [[-6, -5], [7, -8], [3, 8], [-9, 6]] as const;
const woodNodes = [[-3, 2], [6, 4], [12, 7]] as const;
const stoneNodes = [[-11, -12], [11, -5]] as const;
type BuildPiece = { id: number; kind: "cabin" | "lamp" };

function Tree({ p, scale = 1 }: { p: [number, number, number]; scale?: number }) {
  return <group position={p} scale={scale}>
    <mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[0.16, 0.24, 2, 7]} /><meshStandardMaterial color="#795039" /></mesh>
    <mesh position={[0, 2.2, 0]} castShadow><coneGeometry args={[1.05, 2.2, 8]} /><meshStandardMaterial color="#26794d" /></mesh>
    <mesh position={[0.35, 2.15, 0]}><sphereGeometry args={[0.5, 8, 8]} /><meshStandardMaterial color="#3e9b5b" /></mesh>
  </group>;
}

function House({ p, color }: { p: [number, number, number]; color: string }) {
  return <group position={p}>
    <mesh position={[0, 1, 0]} castShadow><boxGeometry args={[2.8, 2, 2.5]} /><meshStandardMaterial color={color} /></mesh>
    <mesh position={[0, 2.3, 0]} castShadow><coneGeometry args={[2.1, 1.1, 4]} /><meshStandardMaterial color="#8b5139" /></mesh>
    <mesh position={[0, 0.7, 1.27]}><boxGeometry args={[0.6, 1.35, 0.08]} /><meshStandardMaterial color="#513728" /></mesh>
  </group>;
}

type PlayerControls = {
  keys: React.MutableRefObject<Set<string>>;
  pad: React.MutableRefObject<[number, number]>;
  onNear: (value: boolean) => void;
  player: React.RefObject<THREE.Group | null>;
};

function Avatar({ keys, pad, onNear, player }: PlayerControls) {
  const sprite = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const texture = useMemo(() => new THREE.TextureLoader().load(avatar), []);
  const near = useRef(false);
  const jumpVelocity = useRef(0);
  const jumpWasDown = useRef(false);

  useFrame((_, dt) => {
    if (!player.current) return;
    const group = player.current;
    const pressed = keys.current;
    const jumpPressed = pressed.has(" ");
    if (jumpPressed && !jumpWasDown.current && group.position.y <= 0.001) jumpVelocity.current = 7.5;
    jumpWasDown.current = jumpPressed;
    jumpVelocity.current = Math.max(-12, jumpVelocity.current - 18 * dt);
    group.position.y = Math.max(0, group.position.y + jumpVelocity.current * dt);
    if (group.position.y === 0) jumpVelocity.current = 0;

    const z = (pressed.has("w") || pressed.has("arrowup") ? 1 : 0) - (pressed.has("s") || pressed.has("arrowdown") ? 1 : 0) + pad.current[1];
    const x = (pressed.has("d") || pressed.has("arrowright") ? 1 : 0) - (pressed.has("a") || pressed.has("arrowleft") ? 1 : 0) + pad.current[0];
    const direction = new THREE.Vector2(x, z);
    if (direction.lengthSq() > 0.01) {
      direction.normalize();
      group.position.x = THREE.MathUtils.clamp(group.position.x + direction.x * dt * 5, -16, 16);
      group.position.z = THREE.MathUtils.clamp(group.position.z + direction.y * dt * 5, -16, 16);
      group.rotation.y = Math.atan2(direction.x, direction.y);
    }

    camera.position.lerp(new THREE.Vector3(group.position.x, 6.5 + group.position.y * 0.35, group.position.z + 10), 1 - Math.pow(0.001, dt));
    camera.lookAt(group.position.x, 1 + group.position.y, group.position.z - 1);
    if (sprite.current) sprite.current.lookAt(camera.position.x, group.position.y + 1.4, camera.position.z);

    const isNear = Math.hypot(group.position.x, group.position.z - 1) < 3.5;
    if (isNear !== near.current) {
      near.current = isNear;
      onNear(isNear);
    }
  });

  return <group ref={player} position={[0, 0, 9]}>
    <mesh ref={sprite} position={[0, 1.4, 0]}>
      <planeGeometry args={[1.8, 2.9]} />
      <meshBasicMaterial map={texture} transparent alphaTest={0.08} side={THREE.DoubleSide} />
    </mesh>
  </group>;
}

function Scene({ keys, pad, collected, collect, woodCollected, collectWood, stoneCollected, collectStone, builds, onNear }: {
  keys: PlayerControls["keys"];
  pad: PlayerControls["pad"];
  collected: number[];
  collect: (index: number) => void;
  woodCollected: number[];
  collectWood: (index: number) => void;
  stoneCollected: number[];
  collectStone: (index: number) => void;
  builds: BuildPiece[];
  onNear: (value: boolean) => void;
}) {
  const player = useRef<THREE.Group>(null);
  const orbs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const position = player.current?.position;
    if (!position) return;
    lights.forEach(([x, z], index) => {
      if (!collected.includes(index) && Math.hypot(position.x - x, position.z - z) < 1.4) collect(index);
      if (orbs.current[index]) orbs.current[index]!.rotation.y += 0.02;
    });
    woodNodes.forEach(([x, z], index) => { if (!woodCollected.includes(index) && Math.hypot(position.x - x, position.z - z) < 1.5) collectWood(index); });
    stoneNodes.forEach(([x, z], index) => { if (!stoneCollected.includes(index) && Math.hypot(position.x - x, position.z - z) < 1.5) collectStone(index); });
  });

  return <>
    <color attach="background" args={["#9ad8e8"]} />
    <fog attach="fog" args={["#b6e4d7", 24, 58]} />
    <Sky sunPosition={[70, 35, 15]} />
    <ambientLight intensity={1.2} />
    <directionalLight position={[12, 20, 8]} intensity={2} castShadow />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[100, 100]} /><meshStandardMaterial color="#79b96e" /></mesh>
    <mesh position={[0, 0.04, -2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[7, 42]} /><meshStandardMaterial color="#d8c28e" /></mesh>
    <mesh position={[10, 0.08, -1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[5, 42]} /><meshStandardMaterial color="#4caec1" roughness={0.2} /></mesh>
    {Array.from({ length: 18 }, (_, index) => <Tree key={index} p={[-15 + (index % 6) * 5.8, 0, -13 + Math.floor(index / 6) * 12]} scale={0.8 + (index % 3) * 0.15} />)}
    <House p={[-10, 0, -8]} color="#e8c68d" />
    <House p={[4, 0, -13]} color="#d7a66f" />
    <House p={[-12, 0, 10]} color="#e5d4a8" />
    <group position={[0, 0, 1]}>
      <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.2, 0.3, 2.4, 10]} /><meshStandardMaterial color="#80603b" /></mesh>
      <mesh position={[0, 2.8, 0]}><sphereGeometry args={[0.95, 16, 12]} /><meshStandardMaterial color="#3b9654" /></mesh>
      <mesh position={[0, 3.2, 0]}><sphereGeometry args={[0.4, 12, 10]} /><meshStandardMaterial color="#f4d36e" emissive="#b47a16" /></mesh>
    </group>
    {woodNodes.map(([x, z], index) => !woodCollected.includes(index) && <Float key={`wood-${index}`} speed={1.2}><mesh position={[x, 0.45, z]}><boxGeometry args={[0.65, 0.65, 0.65]} /><meshStandardMaterial color="#a96d36" emissive="#48240b" /></mesh></Float>)}
    {stoneNodes.map(([x, z], index) => !stoneCollected.includes(index) && <Float key={`stone-${index}`} speed={1.1}><mesh position={[x, 0.5, z]}><dodecahedronGeometry args={[0.55, 0]} /><meshStandardMaterial color="#aab4c0" /></mesh></Float>)}
    {builds.map((piece, index) => { const x = -13 + (index % 6) * 5; const z = -15 + Math.floor(index / 6) * 5; return <group key={piece.id} position={[x, 0, z]}><mesh position={[0, 0.6, 0]} castShadow><boxGeometry args={piece.kind === "cabin" ? [1.8, 1.2, 1.8] : [0.45, 1.3, 0.45]} /><meshStandardMaterial color={piece.kind === "cabin" ? "#d7a66f" : "#d8b84a"} emissive={piece.kind === "lamp" ? "#b47a16" : "#000000"} /></mesh>{piece.kind === "cabin" && <mesh position={[0, 1.5, 0]}><coneGeometry args={[1.45, 0.8, 4]} /><meshStandardMaterial color="#8b5139" /></mesh>}</group>; })}
    {lights.map(([x, z], index) => !collected.includes(index) && <Float key={index} speed={1.8}>
      <mesh ref={(element) => { orbs.current[index] = element; }} position={[x, 0.8, z]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color="#fff0a1" emissive="#ffc94f" emissiveIntensity={1.4} />
      </mesh>
    </Float>)}
    <Sparkles count={80} scale={[32, 7, 32]} color="#fff1b0" />
    <Avatar keys={keys} pad={pad} onNear={onNear} player={player} />
  </>;
}

function DirectionButton({ label, direction, pad }: {
  label: string;
  direction: [number, number];
  pad: React.MutableRefObject<[number, number]>;
}) {
  const stop = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    pad.current = [0, 0];
  };
  return <button
    type="button"
    aria-label={label}
    onPointerDown={(event) => { event.preventDefault(); pad.current = direction; }}
    onPointerUp={stop}
    onPointerLeave={stop}
    onPointerCancel={stop}
    className="grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-[#06232ddd] text-xl font-black text-white shadow-lg active:bg-amber-300 active:text-[#25331e]"
    style={{ touchAction: "none" }}
  >{label}</button>;
}

export function CreationWorld() {
  const keys = useRef(new Set<string>());
  const pad = useRef<[number, number]>([0, 0]);
  const [collected, setCollected] = useState<number[]>([]);
  const [woodCollected, setWoodCollected] = useState<number[]>([]);
  const [stoneCollected, setStoneCollected] = useState<number[]>([]);
  const [woodInventory, setWoodInventory] = useState(0);
  const [stoneInventory, setStoneInventory] = useState(0);
  const [builds, setBuilds] = useState<BuildPiece[]>([]);
  const [near, setNear] = useState(false);
  const [message, setMessage] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("av-creation-lights");
      if (saved) { const parsed: unknown = JSON.parse(saved); if (Array.isArray(parsed)) setCollected(parsed.filter((value): value is number => Number.isInteger(value) && value >= 0 && value < lights.length)); }
      const savedWood = localStorage.getItem("av-world-wood-nodes"); if (savedWood) { const parsed: unknown = JSON.parse(savedWood); if (Array.isArray(parsed)) setWoodCollected(parsed.filter((value): value is number => Number.isInteger(value) && value >= 0 && value < woodNodes.length)); }
      const savedStone = localStorage.getItem("av-world-stone-nodes"); if (savedStone) { const parsed: unknown = JSON.parse(savedStone); if (Array.isArray(parsed)) setStoneCollected(parsed.filter((value): value is number => Number.isInteger(value) && value >= 0 && value < stoneNodes.length)); }
      const savedWoodInventory = localStorage.getItem("av-world-wood-inventory"); if (savedWoodInventory) setWoodInventory(Math.max(0, Number(savedWoodInventory) || 0));
      const savedStoneInventory = localStorage.getItem("av-world-stone-inventory"); if (savedStoneInventory) setStoneInventory(Math.max(0, Number(savedStoneInventory) || 0));
      const savedBuilds = localStorage.getItem("av-world-builds"); if (savedBuilds) { const parsed: unknown = JSON.parse(savedBuilds); if (Array.isArray(parsed)) setBuilds(parsed.filter((value): value is BuildPiece => value && Number.isInteger(value.id) && (value.kind === "cabin" || value.kind === "lamp"))); }
    } catch { /* El juego sigue disponible si el almacenamiento está bloqueado. */ }

    const pressedKeys = keys.current;
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
      pressedKeys.add(key);
    };
    const up = (event: KeyboardEvent) => pressedKeys.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      pressedKeys.clear();
    };
  }, []);

  const collect = (index: number) => setCollected((current) => {
    if (current.includes(index)) return current;
    const next = [...current, index];
    try { localStorage.setItem("av-creation-lights", JSON.stringify(next)); } catch { /* Guardado local opcional. */ }
    setMessage("¡Encontraste una luz de la creación!");
    return next;
  });

  const collectWood = (index: number) => setWoodCollected((current) => { if (current.includes(index)) return current; const next = [...current, index]; try { localStorage.setItem("av-world-wood-nodes", JSON.stringify(next)); } catch {} setWoodInventory((count) => { const value = count + 1; try { localStorage.setItem("av-world-wood-inventory", String(value)); } catch {} return value; }); setMessage("¡Recogiste madera para construir!"); return next; });
  const collectStone = (index: number) => setStoneCollected((current) => { if (current.includes(index)) return current; const next = [...current, index]; try { localStorage.setItem("av-world-stone-nodes", JSON.stringify(next)); } catch {} setStoneInventory((count) => { const value = count + 1; try { localStorage.setItem("av-world-stone-inventory", String(value)); } catch {} return value; }); setMessage("¡Recogiste piedra para tus construcciones!"); return next; });
  const build = (kind: BuildPiece["kind"]) => { const woodCost = kind === "cabin" ? 2 : 1; const stoneCost = kind === "cabin" ? 1 : 0; if (woodInventory < woodCost || stoneInventory < stoneCost) { setMessage(`Materiales insuficientes. Necesitas ${woodCost} madera y ${stoneCost} piedra.`); return; } const piece: BuildPiece = { id: Date.now(), kind }; setBuilds((current) => { const next = [...current, piece]; try { localStorage.setItem("av-world-builds", JSON.stringify(next)); } catch {} return next; }); setWoodInventory((count) => { const value = count - woodCost; try { localStorage.setItem("av-world-wood-inventory", String(value)); } catch {} return value; }); setStoneInventory((count) => { const value = count - stoneCost; try { localStorage.setItem("av-world-stone-inventory", String(value)); } catch {} return value; }); setMessage(kind === "cabin" ? "¡Construiste una cabaña decorativa!" : "¡Colocaste una lámpara de luz!"); };

  const interact = () => {
    if (!started) {
      setStarted(true);
      setMessage("Guardián: ¡Bienvenido al jardín! Reúne las cuatro luces doradas que se dispersaron por el valle.");
    } else {
      setMessage(collected.length === lights.length
        ? "¡Misión completada! Has reunido las cuatro luces. Cuida la creación y trata con bondad a todos."
        : `Guardián: explora el valle. Llevas ${collected.length} de 4 luces.`);
    }
  };

  const jumpDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    keys.current.add(" ");
  };
  const jumpUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    keys.current.delete(" ");
  };

  return <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#082632] shadow-2xl">
    <div className="relative h-[min(72vh,680px)] min-h-[470px]">
      <Canvas shadows camera={{ position: [0, 7, 19], fov: 48 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}><Scene keys={keys} pad={pad} collected={collected} collect={collect} woodCollected={woodCollected} collectWood={collectWood} stoneCollected={stoneCollected} collectStone={collectStone} builds={builds} onNear={setNear} /></Suspense>
      </Canvas>

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/15 bg-[#06232dcc] p-3 text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Mundo 1 · Jardín de la creación</p>
        <p className="text-sm font-bold">Reúne las luces del valle</p>
        <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-amber-300" style={{ width: (collected.length / lights.length * 100) + "%" }} /></div>
        <p className="text-xs text-white/70">{collected.length}/4 luces · 🪵 {woodInventory} · 🪨 {stoneInventory}</p>
      </div>

      <div className="absolute right-4 top-4 rounded-xl bg-[#06232dcc] p-3 text-xs text-white">
        <b>W A S D</b> / flechas: mover<br /><b>Espacio</b>: saltar
      </div>

      <div className="absolute bottom-3 left-3 grid grid-cols-3 gap-1 sm:hidden">
        <span />
        <DirectionButton label="↑" direction={[0, 1]} pad={pad} />
        <span />
        <DirectionButton label="←" direction={[-1, 0]} pad={pad} />
        <DirectionButton label="↓" direction={[0, -1]} pad={pad} />
        <DirectionButton label="→" direction={[1, 0]} pad={pad} />
      </div>

      <button
        type="button"
        onPointerDown={jumpDown}
        onPointerUp={jumpUp}
        onPointerLeave={jumpUp}
        onPointerCancel={jumpUp}
        className="absolute bottom-5 right-4 rounded-full border border-white/25 bg-[#06232ddd] px-5 py-4 text-sm font-black text-white shadow-lg active:bg-amber-300 active:text-[#25331e] sm:hidden"
        style={{ touchAction: "none" }}
      >SALTAR</button>

      <div className="absolute bottom-3 right-3 hidden flex-col gap-2 sm:flex"><button type="button" onClick={() => build("cabin")} className="rounded-xl border border-white/20 bg-[#06232ddd] px-3 py-2 text-xs font-black text-white">🏡 Construir cabaña (2🪵 1🪨)</button><button type="button" onClick={() => build("lamp")} className="rounded-xl border border-white/20 bg-[#06232ddd] px-3 py-2 text-xs font-black text-white">💡 Colocar lámpara (1🪵)</button></div>
      <div className="absolute bottom-24 right-3 flex flex-col gap-2 sm:hidden"><button type="button" onClick={() => build("cabin")} className="rounded-xl border border-white/20 bg-[#06232ddd] px-3 py-2 text-[10px] font-black text-white">🏡 Cabaña</button><button type="button" onClick={() => build("lamp")} className="rounded-xl border border-white/20 bg-[#06232ddd] px-3 py-2 text-[10px] font-black text-white">💡 Lámpara</button></div>
      {near && <button type="button" onClick={interact} className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-5 py-3 text-sm font-black text-[#25331e]">Hablar con el guardián</button>}
      {message && <div role="status" className="absolute bottom-4 left-4 right-4 rounded-2xl border border-amber-200/40 bg-[#082b2bef] p-3 text-sm text-amber-50 sm:bottom-4">
        {message}<button type="button" onClick={() => setMessage("")} className="ml-3 underline">Cerrar</button>
      </div>}
    </div>
    <div className="border-t border-white/10 bg-[#061e29] px-4 py-3 text-xs text-white/70">Personaje oficial Vida Kids · recursos y construcciones decorativas guardados localmente en este dispositivo · prototipo de construcción</div>
  </section>;
}
