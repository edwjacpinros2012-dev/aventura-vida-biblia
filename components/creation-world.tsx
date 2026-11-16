"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html, MeshReflectorMaterial, Sky, Sparkles } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { usePlayerProgress } from "@/components/player-progress-provider";

const lights = [[-6, -5], [7, -8], [3, 8], [-9, 6]] as const;
const woodNodes = [[-3, 2], [6, 4], [12, 7]] as const;
const stoneNodes = [[-11, -12], [11, -5]] as const;
const collisionObstacles = [
  { x: -10, z: -8, radius: 2.1 },
  { x: 4, z: -13, radius: 2.1 },
  { x: -12, z: 10, radius: 2.1 },
  { x: 0, z: 1, radius: 1.25 },
  // Los NPC tienen un perímetro físico para que el jugador no atraviese sus modelos.
  { x: 2.6, z: 1, radius: 0.85 },
  { x: -7, z: 3, radius: 0.85 },
  { x: 8, z: 7, radius: 0.85 },
  ...Array.from({ length: 18 }, (_, index) => ({
    x: -15 + (index % 6) * 5.8,
    z: -13 + Math.floor(index / 6) * 12,
    radius: 1.05,
  })),
];
const isWorldBlocked = (x: number, z: number) =>
  collisionObstacles.some((obstacle) => Math.hypot(x - obstacle.x, z - obstacle.z) < obstacle.radius);
type BuildPiece = { id: number; kind: "cabin" | "lamp"; x?: number; z?: number };

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

type WorldNpcProps = {
  position: [number, number, number];
  robeColor: string;
  trimColor: string;
  hairColor: string;
  title: string;
  player: React.RefObject<THREE.Group | null>;
};

function WorldNpc({ position, robeColor, trimColor, hairColor, title, player }: WorldNpcProps) {
  const root = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    if (!root.current) return;
    const target = player.current?.position;
    if (target) {
      const desired = Math.atan2(target.x - root.current.position.x, target.z - root.current.position.z);
      root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, desired, 1 - Math.exp(-dt * 2.2));
    }
    root.current.position.y = Math.sin(state.clock.elapsedTime * 1.35 + position[0]) * 0.025;
    if (leftArm.current) leftArm.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.1) * 0.055;
    if (rightArm.current) rightArm.current.rotation.z = -Math.sin(state.clock.elapsedTime * 1.1) * 0.055;
  });

  return <group ref={root} position={position}>
    <mesh position={[0, 0.72, 0]} castShadow><cylinderGeometry args={[0.34, 0.5, 1.25, 10]} /><meshStandardMaterial color={robeColor} roughness={0.86} /></mesh>
    <mesh position={[0, 1.4, 0]} castShadow><sphereGeometry args={[0.31, 14, 10]} /><meshStandardMaterial color="#d7a17d" roughness={0.9} /></mesh>
    <mesh position={[0, 1.58, -0.035]} castShadow><sphereGeometry args={[0.315, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial color={hairColor} roughness={0.95} /></mesh>
    <mesh position={[-0.11, 1.42, 0.27]}><sphereGeometry args={[0.025, 7, 6]} /><meshStandardMaterial color="#30241f" /></mesh>
    <mesh position={[0.11, 1.42, 0.27]}><sphereGeometry args={[0.025, 7, 6]} /><meshStandardMaterial color="#30241f" /></mesh>
    <group ref={leftArm} position={[-0.37, 1.12, 0]}><mesh position={[0, -0.24, 0]} rotation={[0, 0, -0.18]} castShadow><capsuleGeometry args={[0.105, 0.42, 4, 8]} /><meshStandardMaterial color={robeColor} /></mesh><mesh position={[0, -0.49, 0.02]}><sphereGeometry args={[0.105, 8, 7]} /><meshStandardMaterial color="#d7a17d" /></mesh></group>
    <group ref={rightArm} position={[0.37, 1.12, 0]}><mesh position={[0, -0.24, 0]} rotation={[0, 0, 0.18]} castShadow><capsuleGeometry args={[0.105, 0.42, 4, 8]} /><meshStandardMaterial color={robeColor} /></mesh><mesh position={[0, -0.49, 0.02]}><sphereGeometry args={[0.105, 8, 7]} /><meshStandardMaterial color="#d7a17d" /></mesh></group>
    <mesh position={[0, 0.73, 0.31]}><boxGeometry args={[0.28, 0.52, 0.045]} /><meshStandardMaterial color={trimColor} metalness={0.12} roughness={0.55} /></mesh>
    <mesh position={[0.58, 0.88, 0.08]}><cylinderGeometry args={[0.035, 0.045, 1.75, 7]} /><meshStandardMaterial color="#795039" /></mesh>
    <mesh position={[0.58, 1.82, 0.08]}><sphereGeometry args={[0.11, 9, 7]} /><meshStandardMaterial color={trimColor} emissive={trimColor} emissiveIntensity={0.22} /></mesh>
    <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.24, 0.29, 0.12, 10]} /><meshStandardMaterial color="#493d39" /></mesh>
    <Html position={[0, 2.05, 0]} center distanceFactor={10} style={{ pointerEvents: "none" }}><div className="whitespace-nowrap rounded-full border border-amber-200/60 bg-[#082b2b]/90 px-2 py-1 text-[10px] font-black text-amber-100 shadow-lg">{title}</div></Html>
  </group>;
}

type PlayerControls = {
  avatarKey: string;
  equippedSlugs: string[];
  keys: React.MutableRefObject<Set<string>>;
  pad: React.MutableRefObject<[number, number]>;
  onNear: (value: boolean) => void;
  minimapMarker: React.RefObject<HTMLSpanElement | null>;
  player: React.RefObject<THREE.Group | null>;
  playerPosition: React.MutableRefObject<[number, number, number]>;
};

function Avatar({ keys, pad, onNear, minimapMarker, player, playerPosition, avatarKey, equippedSlugs }: PlayerControls) {
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const near = useRef(false);
  const jumpVelocity = useRef(0);
  const jumpWasDown = useRef(false);
  const lastReportedPosition = useRef<[number, number]>([0, 9]);

  const palette = useMemo(() => {
    const palettes: Record<string, { shirt: string; lower: string; accent: string; hair: string }> = {
      "vida-kids-01-rosa-morado": { shirt: "#ed91c2", lower: "#7951a5", accent: "#f5c5df", hair: "#493027" },
      "vida-kids-02-blanco": { shirt: "#f3f0e8", lower: "#4b6380", accent: "#b8d4e8", hair: "#493027" },
      "vida-kids-03-azul": { shirt: "#397fc1", lower: "#314c75", accent: "#9dd9ed", hair: "#493027" },
      "vida-kids-04-beige": { shirt: "#cbb28c", lower: "#78624b", accent: "#ead8b9", hair: "#493027" },
      "vida-kids-05-verde": { shirt: "#55a66b", lower: "#466d58", accent: "#b9e1a8", hair: "#493027" },
      "vida-kids-06-rojo": { shirt: "#cf5555", lower: "#465b79", accent: "#f0b0a5", hair: "#493027" },
    };
    return palettes[avatarKey] ?? { shirt: "#4b8fba", lower: "#435d78", accent: "#c4e6ef", hair: "#493027" };
  }, [avatarKey]);

  useFrame((state, dt) => {
    if (!player.current) return;
    const group = player.current;
    playerPosition.current = [group.position.x, group.position.z, group.rotation.y];
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
    const moving = direction.lengthSq() > 0.01;
    if (moving) {
      direction.normalize();
      const nextX = THREE.MathUtils.clamp(group.position.x + direction.x * dt * 5, -16, 16);
      if (!isWorldBlocked(nextX, group.position.z)) group.position.x = nextX;
      const nextZ = THREE.MathUtils.clamp(group.position.z + direction.y * dt * 5, -16, 16);
      if (!isWorldBlocked(group.position.x, nextZ)) group.position.z = nextZ;
      group.rotation.y = Math.atan2(direction.x, direction.y);
    }

    const stride = moving ? Math.sin(state.clock.elapsedTime * 10) * 0.62 : 0;
    if (leftArm.current) leftArm.current.rotation.x = stride;
    if (rightArm.current) rightArm.current.rotation.x = -stride;
    if (leftLeg.current) leftLeg.current.rotation.x = -stride;
    if (rightLeg.current) rightLeg.current.rotation.x = stride;
    if (body.current) {
      body.current.position.y = moving && group.position.y === 0 ? Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.045 : 0;
      body.current.rotation.z = moving ? Math.sin(state.clock.elapsedTime * 5) * 0.025 : 0;
    }

    camera.position.lerp(new THREE.Vector3(group.position.x, 6.5 + group.position.y * 0.35, group.position.z + 10), 1 - Math.pow(0.001, dt));
    camera.lookAt(group.position.x, 1 + group.position.y, group.position.z - 1);
    if (Math.hypot(group.position.x - lastReportedPosition.current[0], group.position.z - lastReportedPosition.current[1]) >= 0.25) {
      lastReportedPosition.current = [group.position.x, group.position.z];
      if (minimapMarker.current) {
        minimapMarker.current.style.left = `${((group.position.x + 16) / 32) * 100}%`;
        minimapMarker.current.style.top = `${((group.position.z + 16) / 32) * 100}%`;
      }
    }

    const isNear = Math.hypot(group.position.x, group.position.z - 1) < 3.5;
    if (isNear !== near.current) {
      near.current = isNear;
      onNear(isNear);
    }
  });

  return <group ref={player} position={[0, 0, 9]}>
    <group ref={body}>
      {/* Modelo humanoide 3D articulado: el avatar oficial determina su vestuario. */}
      <mesh position={[0, 1.48, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.38, 0.72, 5, 10]} />
        <meshStandardMaterial color={palette.shirt} roughness={0.78} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.34, avatarKey === "vida-kids-01-rosa-morado" ? 0.58 : 0.4, 0.38, 10]} />
        <meshStandardMaterial color={palette.lower} roughness={0.86} />
      </mesh>
      <mesh position={[0, 2.03, 0]}><cylinderGeometry args={[0.14, 0.16, 0.2, 10]} /><meshStandardMaterial color="#d99f79" /></mesh>
      <mesh position={[0, 2.42, 0]} castShadow>
        <sphereGeometry args={[0.43, 16, 12]} />
        <meshStandardMaterial color="#d99f79" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.69, -0.035]} castShadow>
        <sphereGeometry args={[0.435, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        <meshStandardMaterial color={palette.hair} roughness={0.95} />
      </mesh>
      <mesh position={[-0.155, 2.44, 0.375]}><sphereGeometry args={[0.045, 8, 8]} /><meshStandardMaterial color="#30241f" /></mesh>
      <mesh position={[0.155, 2.44, 0.375]}><sphereGeometry args={[0.045, 8, 8]} /><meshStandardMaterial color="#30241f" /></mesh>
      <mesh position={[0, 2.32, 0.408]}><sphereGeometry args={[0.045, 8, 8]} /><meshStandardMaterial color="#bd8062" /></mesh>
      <mesh position={[0, 2.23, 0.392]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.075, 0.014, 6, 12, Math.PI]} /><meshStandardMaterial color="#7c3d3d" /></mesh>
      <group ref={leftArm} position={[-0.47, 1.83, 0]}>
        <mesh position={[0, -0.34, 0]} rotation={[0, 0, -0.12]} castShadow><capsuleGeometry args={[0.14, 0.48, 4, 8]} /><meshStandardMaterial color={palette.shirt} /></mesh>
        <mesh position={[0, -0.68, 0.015]} castShadow><sphereGeometry args={[0.14, 9, 7]} /><meshStandardMaterial color="#d99f79" /></mesh>
      </group>
      <group ref={rightArm} position={[0.47, 1.83, 0]}>
        <mesh position={[0, -0.34, 0]} rotation={[0, 0, 0.12]} castShadow><capsuleGeometry args={[0.14, 0.48, 4, 8]} /><meshStandardMaterial color={palette.shirt} /></mesh>
        <mesh position={[0, -0.68, 0.015]} castShadow><sphereGeometry args={[0.14, 9, 7]} /><meshStandardMaterial color="#d99f79" /></mesh>
      </group>
      <group ref={leftLeg} position={[-0.2, 0.88, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow><capsuleGeometry args={[0.16, 0.48, 4, 8]} /><meshStandardMaterial color={palette.lower} /></mesh>
        <mesh position={[0, -0.68, 0.1]} castShadow><boxGeometry args={[0.29, 0.17, 0.43]} /><meshStandardMaterial color="#493d39" /></mesh>
      </group>
      <group ref={rightLeg} position={[0.2, 0.88, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow><capsuleGeometry args={[0.16, 0.48, 4, 8]} /><meshStandardMaterial color={palette.lower} /></mesh>
        <mesh position={[0, -0.68, 0.1]} castShadow><boxGeometry args={[0.29, 0.17, 0.43]} /><meshStandardMaterial color="#493d39" /></mesh>
      </group>
      {equippedSlugs.includes("yelmo-salvacion") && <group position={[0, 2.72, 0]}>
        <mesh castShadow><sphereGeometry args={[0.48, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} /><meshStandardMaterial color="#e8bd55" metalness={0.55} roughness={0.35} /></mesh>
        <mesh position={[0, -0.12, 0.08]}><boxGeometry args={[0.82, 0.12, 0.12]} /><meshStandardMaterial color="#f6d878" metalness={0.35} /></mesh>
      </group>}
      {equippedSlugs.includes("tunica-pastor-amable") && <mesh position={[0, 1.5, 0.31]} castShadow>
        <boxGeometry args={[0.66, 0.72, 0.13]} /><meshStandardMaterial color="#d9eee0" roughness={0.85} />
      </mesh>}
      {equippedSlugs.includes("capa-bondad") && <mesh position={[0, 1.38, -0.25]} castShadow>
        <boxGeometry args={[0.92, 1.25, 0.1]} /><meshStandardMaterial color="#6d91b8" roughness={0.82} side={THREE.DoubleSide} />
      </mesh>}
    </group>
  </group>;
}
function Scene({ keys, pad, collected, collect, woodCollected, collectWood, stoneCollected, collectStone, builds, onNear, minimapMarker, playerPosition, avatarKey, equippedSlugs }: {
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
  minimapMarker: React.RefObject<HTMLSpanElement | null>;
  playerPosition: PlayerControls["playerPosition"];
  avatarKey: string;
  equippedSlugs: string[];
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
    <mesh position={[10, 0.08, -1]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[5, 42]} /><MeshReflectorMaterial color="#4caec1" roughness={0.22} metalness={0.12} resolution={128} blur={[8, 8]} mixBlur={0.5} mixStrength={0.9} mirror={0.35} depthScale={0.15} reflectorOffset={0.02} /></mesh>
    {Array.from({ length: 18 }, (_, index) => <Tree key={index} p={[-15 + (index % 6) * 5.8, 0, -13 + Math.floor(index / 6) * 12]} scale={0.8 + (index % 3) * 0.15} />)}
    <House p={[-10, 0, -8]} color="#e8c68d" />
    <House p={[4, 0, -13]} color="#d7a66f" />
    <House p={[-12, 0, 10]} color="#e5d4a8" />
    <group position={[0, 0, 1]}>
      <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.2, 0.3, 2.4, 10]} /><meshStandardMaterial color="#80603b" /></mesh>
      <mesh position={[0, 2.8, 0]}><sphereGeometry args={[0.95, 16, 12]} /><meshStandardMaterial color="#3b9654" /></mesh>
      <mesh position={[0, 3.2, 0]}><sphereGeometry args={[0.4, 12, 10]} /><meshStandardMaterial color="#f4d36e" emissive="#b47a16" /></mesh>
    </group>
    <WorldNpc position={[2.6, 0, 1]} robeColor="#e7c46e" trimColor="#f7df91" hairColor="#493027" title="Guardián" player={player} />\n    <WorldNpc position={[-7, 0, 3]} robeColor="#5b9b7a" trimColor="#c5e6b7" hairColor="#4a3028" title="Jardinera" player={player} />\n    <WorldNpc position={[8, 0, 7]} robeColor="#7692c8" trimColor="#d7e7ff" hairColor="#493027" title="Constructor" player={player} />\n    {woodNodes.map(([x, z], index) => !woodCollected.includes(index) && <Float key={`wood-${index}`} speed={1.2}><mesh position={[x, 0.45, z]}><boxGeometry args={[0.65, 0.65, 0.65]} /><meshStandardMaterial color="#a96d36" emissive="#48240b" /></mesh></Float>)}
    {stoneNodes.map(([x, z], index) => !stoneCollected.includes(index) && <Float key={`stone-${index}`} speed={1.1}><mesh position={[x, 0.5, z]}><dodecahedronGeometry args={[0.55, 0]} /><meshStandardMaterial color="#aab4c0" /></mesh></Float>)}
    {builds.map((piece, index) => { const x = piece.x ?? (-13 + (index % 6) * 5); const z = piece.z ?? (-15 + Math.floor(index / 6) * 5); return <group key={piece.id} position={[x, 0, z]}><mesh position={[0, 0.6, 0]} castShadow><boxGeometry args={piece.kind === "cabin" ? [1.8, 1.2, 1.8] : [0.45, 1.3, 0.45]} /><meshStandardMaterial color={piece.kind === "cabin" ? "#d7a66f" : "#d8b84a"} emissive={piece.kind === "lamp" ? "#b47a16" : "#000000"} /></mesh>{piece.kind === "cabin" && <mesh position={[0, 1.5, 0]}><coneGeometry args={[1.45, 0.8, 4]} /><meshStandardMaterial color="#8b5139" /></mesh>}</group>; })}
    {lights.map(([x, z], index) => !collected.includes(index) && <Float key={index} speed={1.8}>
      <mesh ref={(element) => { orbs.current[index] = element; }} position={[x, 0.8, z]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial color="#fff0a1" emissive="#ffc94f" emissiveIntensity={1.4} />
      </mesh>
    </Float>)}
    <Sparkles count={80} scale={[32, 7, 32]} color="#fff1b0" />
    <Avatar keys={keys} pad={pad} onNear={onNear} minimapMarker={minimapMarker} player={player} playerPosition={playerPosition} avatarKey={avatarKey} equippedSlugs={equippedSlugs} />
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
  const { identity, identityReady } = usePlayerProgress();
  const [equippedSlugs, setEquippedSlugs] = useState<string[]>([]);
  useEffect(() => {
    if (!identityReady) return;
    let active = true;
    fetch("/api/economy/equip", { cache: "no-store" })
      .then(async (response) => response.ok ? await response.json() as { equipped?: Array<{ slug: string }> } : { equipped: [] })
      .then((result) => { if (active) setEquippedSlugs((result.equipped ?? []).map((item) => item.slug)); })
      .catch(() => { if (active) setEquippedSlugs([]); });
    return () => { active = false; };
  }, [identityReady, identity.authenticated]);

  const keys = useRef(new Set<string>());
  const pad = useRef<[number, number]>([0, 0]);
  const [collected, setCollected] = useState<number[]>([]);
  const [woodCollected, setWoodCollected] = useState<number[]>([]);
  const [stoneCollected, setStoneCollected] = useState<number[]>([]);
  const [woodInventory, setWoodInventory] = useState(0);
  const [stoneInventory, setStoneInventory] = useState(0);
  const [builds, setBuilds] = useState<BuildPiece[]>([]);
  const [worldStateReady, setWorldStateReady] = useState(false);
  const [worldSaveStatus, setWorldSaveStatus] = useState<"local" | "loading" | "saved" | "error">("local");
  const [worldStateRetry, setWorldStateRetry] = useState(0);
  const worldSaveQueue = useRef<Promise<void>>(Promise.resolve());
  const [near, setNear] = useState(false);
  const minimapPlayerMarker = useRef<HTMLSpanElement>(null);
  const playerPosition = useRef<[number, number, number]>([0, 9, 0]);
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

  useEffect(() => {
    if (!identityReady) return;
    if (!identity.authenticated) {
      setWorldStateReady(true);
      setWorldSaveStatus("local");
      return;
    }

    let active = true;
    setWorldSaveStatus("loading");
    fetch("/api/world/state", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("No se pudo cargar el mundo guardado.");
        return await response.json() as {
          state?: {
            collectedLights?: number[];
            collectedWood?: number[];
            collectedStone?: number[];
            builds?: Array<{ id: number; kind: "cabin" | "lamp"; x?: number; z?: number }>;
          };
        };
      })
      .then(({ state }) => {
        if (!active || !state) return;
        const validLights = Array.isArray(state.collectedLights) ? state.collectedLights.filter((value) => Number.isInteger(value) && value >= 0 && value < lights.length) : [];
        const validWood = Array.isArray(state.collectedWood) ? state.collectedWood.filter((value) => Number.isInteger(value) && value >= 0 && value < woodNodes.length) : [];
        const validStone = Array.isArray(state.collectedStone) ? state.collectedStone.filter((value) => Number.isInteger(value) && value >= 0 && value < stoneNodes.length) : [];
        const validBuilds = Array.isArray(state.builds) ? state.builds.filter((value) => value && Number.isSafeInteger(value.id) && value.id > 0 && (value.kind === "cabin" || value.kind === "lamp") && (value.x === undefined || (Number.isFinite(value.x) && Math.abs(value.x) <= 16)) && (value.z === undefined || (Number.isFinite(value.z) && Math.abs(value.z) <= 16))).slice(0, 32) : [];
        const cabins = validBuilds.filter((piece) => piece.kind === "cabin").length;
        const lampsBuilt = validBuilds.length - cabins;
        setCollected([...new Set(validLights)]);
        setWoodCollected([...new Set(validWood)]);
        setStoneCollected([...new Set(validStone)]);
        setBuilds(validBuilds);
        setWoodInventory(Math.max(0, validWood.length - cabins * 2 - lampsBuilt));
        setStoneInventory(Math.max(0, validStone.length - cabins));
        setWorldSaveStatus("saved");
        setWorldStateReady(true);
      })
      .catch(() => {
        if (active) setWorldSaveStatus("error");
      });
    return () => { active = false; };
  }, [identityReady, identity.authenticated, worldStateRetry]);

  useEffect(() => {
    if (!worldStateReady || !identityReady) return;
    const snapshot = {
      collectedLights: collected,
      collectedWood: woodCollected,
      collectedStone: stoneCollected,
      builds: builds.map(({ id, kind, x, z }, index) => ({ id, kind, x: x ?? (-13 + (index % 6) * 5), z: z ?? (-15 + Math.floor(index / 6) * 5) })),
    };

    if (!identity.authenticated) {
      try {
        localStorage.setItem("av-creation-lights", JSON.stringify(snapshot.collectedLights));
        localStorage.setItem("av-world-wood-nodes", JSON.stringify(snapshot.collectedWood));
        localStorage.setItem("av-world-stone-nodes", JSON.stringify(snapshot.collectedStone));
        localStorage.setItem("av-world-builds", JSON.stringify(snapshot.builds));
        localStorage.setItem("av-world-wood-inventory", String(woodInventory));
        localStorage.setItem("av-world-stone-inventory", String(stoneInventory));
      } catch { /* El guardado local es opcional para visitantes. */ }
      return;
    }

    const timeout = window.setTimeout(() => {
      worldSaveQueue.current = worldSaveQueue.current.catch(() => undefined).then(async () => {
        setWorldSaveStatus("loading");
        const response = await fetch("/api/world/state", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(snapshot),
        });
        if (!response.ok) throw new Error("No se pudo guardar el mundo.");
        setWorldSaveStatus("saved");
      }).catch(() => setWorldSaveStatus("error"));
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [worldStateReady, identityReady, identity.authenticated, collected, woodCollected, stoneCollected, builds, woodInventory, stoneInventory]);

  const collect = (index: number) => setCollected((current) => {
    if (current.includes(index)) return current;
    const next = [...current, index];
    try { localStorage.setItem("av-creation-lights", JSON.stringify(next)); } catch { /* Guardado local opcional. */ }
    setMessage("¡Encontraste una luz de la creación!");
    return next;
  });

  const collectWood = (index: number) => setWoodCollected((current) => { if (current.includes(index)) return current; const next = [...current, index]; try { localStorage.setItem("av-world-wood-nodes", JSON.stringify(next)); } catch {} setWoodInventory((count) => { const value = count + 1; try { localStorage.setItem("av-world-wood-inventory", String(value)); } catch {} return value; }); setMessage("¡Recogiste madera para construir!"); return next; });
  const collectStone = (index: number) => setStoneCollected((current) => { if (current.includes(index)) return current; const next = [...current, index]; try { localStorage.setItem("av-world-stone-nodes", JSON.stringify(next)); } catch {} setStoneInventory((count) => { const value = count + 1; try { localStorage.setItem("av-world-stone-inventory", String(value)); } catch {} return value; }); setMessage("¡Recogiste piedra para tus construcciones!"); return next; });
  const build = (kind: BuildPiece["kind"]) => { const woodCost = kind === "cabin" ? 2 : 1; const stoneCost = kind === "cabin" ? 1 : 0; if (woodInventory < woodCost || stoneInventory < stoneCost) { setMessage(`Materiales insuficientes. Necesitas ${woodCost} madera y ${stoneCost} piedra.`); return; } const [playerX, playerZ, rotation] = playerPosition.current;
    const candidates = Array.from({ length: 12 }, (_, index) => {
      const angle = rotation + (index * Math.PI) / 6;
      const distance = index === 0 ? 2.8 : 2.4 + Math.floor((index - 1) / 6) * 1.2;
      return { x: THREE.MathUtils.clamp(playerX + Math.sin(angle) * distance, -15, 15), z: THREE.MathUtils.clamp(playerZ + Math.cos(angle) * distance, -15, 15) };
    });
    const placement = candidates.find((candidate) =>
      !isWorldBlocked(candidate.x, candidate.z) &&
      builds.every((existing, existingIndex) => Math.hypot(candidate.x - (existing.x ?? (-13 + (existingIndex % 6) * 5)), candidate.z - (existing.z ?? (-15 + Math.floor(existingIndex / 6) * 5))) > 2)
    );
    if (!placement) { setMessage("No hay espacio libre cerca. Muévete a otra zona para construir."); return; }
    const piece: BuildPiece = { id: Date.now(), kind, ...placement }; setBuilds((current) => { const next = [...current, piece]; try { localStorage.setItem("av-world-builds", JSON.stringify(next)); } catch {} return next; }); setWoodInventory((count) => { const value = count - woodCost; try { localStorage.setItem("av-world-wood-inventory", String(value)); } catch {} return value; }); setStoneInventory((count) => { const value = count - stoneCost; try { localStorage.setItem("av-world-stone-inventory", String(value)); } catch {} return value; }); setMessage(kind === "cabin" ? "¡Construiste una cabaña decorativa!" : "¡Colocaste una lámpara de luz!"); };

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
        <Suspense fallback={null}><Scene keys={keys} pad={pad} collected={collected} collect={collect} woodCollected={woodCollected} collectWood={collectWood} stoneCollected={stoneCollected} collectStone={collectStone} builds={builds} onNear={setNear} minimapMarker={minimapPlayerMarker} playerPosition={playerPosition} avatarKey={identity.avatarKey} equippedSlugs={equippedSlugs} /></Suspense>
      </Canvas>

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/15 bg-[#06232dcc] p-3 text-white">
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Mundo 1 · Jardín de la creación</p>
        <p className="text-sm font-bold">Reúne las luces del valle</p>
        <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-amber-300" style={{ width: (collected.length / lights.length * 100) + "%" }} /></div>
        <p className="text-xs text-white/70">{collected.length}/4 luces · 🪵 {woodInventory} · 🪨 {stoneInventory}</p>
      </div>

      <div className="pointer-events-none absolute right-4 top-4 rounded-2xl border border-white/20 bg-[#06232de8] p-2 text-white shadow-lg" role="img" aria-label="Minimapa del valle">
        <p className="mb-1 text-center text-[9px] font-black uppercase tracking-widest text-amber-200">Mapa del valle</p>
        <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-white/15" style={{ background: "linear-gradient(135deg, #7aa96d 0%, #568b61 100%)" }}>
          <div className="absolute left-[42%] top-0 h-full w-[16%] -rotate-[18deg] bg-[#d8c28e]/90" />
          <div className="absolute left-[68%] top-0 h-full w-[13%] rotate-[8deg] bg-[#4caec1]/90" />
          {lights.map(([x, z], index) => !collected.includes(index) && <span key={index} className="absolute h-1.5 w-1.5 rounded-full border border-amber-100 bg-amber-300" style={{ left: `${((x + 16) / 32) * 100}%`, top: `${((z + 16) / 32) * 100}%` }} />)}
          <span ref={minimapPlayerMarker} className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-500 shadow-[0_0_0_2px_#082632]" style={{ left: "50%", top: "78.125%" }} />
        </div>
        <p className="mt-1 text-center text-[9px] text-white/70">● Tú · ◆ Luces restantes</p>
      </div>

      <div className="pointer-events-none absolute right-4 top-[9.5rem] rounded-xl bg-[#06232dcc] p-2 text-[10px] text-white sm:text-xs">
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
    <div className="border-t border-white/10 bg-[#061e29] px-4 py-3 text-xs text-white/70">Personaje oficial seleccionado · equipamiento de la tienda · {identity.authenticated ? (worldSaveStatus === "saved" ? "Mundo guardado en tu cuenta" : worldSaveStatus === "loading" ? "Sincronizando mundo…" : worldSaveStatus === "error" ? "No se pudo sincronizar el mundo" : "Esperando guardado") : "Mundo guardado en este dispositivo"} {identity.authenticated && !worldStateReady && worldSaveStatus === "error" && <button type="button" onClick={() => { setWorldSaveStatus("loading"); setWorldStateRetry((attempt) => attempt + 1); }} className="ml-2 underline">Reintentar carga</button>}</div>
  </section>;
}
