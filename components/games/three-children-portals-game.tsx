"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";
import { CHAPTER_GUIDANCE, getGameStoreState, useGameStore, type ChildProfile } from "@/store/use-game-store";

type Chapter = {
  title: string;
  scene: string;
  objective: string;
  lesson: string;
  environment: "portal" | "ship" | "battle" | "flood" | "forest" | "tree" | "avalanche";
};

const chapters: Chapter[] = [
  {
    title: "El portal poderoso",
    scene: "Los tres amigos encuentran un portal brillante. Al cruzarlo descubren una nave enorme y misteriosa, llena de criaturas extrañas.",
    objective: "Reúne las tres señales de luz y llega al portal de la nave.",
    lesson: "Dios nos acompaña cuando damos un paso con valentía y prudencia.",
    environment: "portal",
  },
  {
    title: "La nave de los monstruos",
    scene: "La nave está llena de pasillos, cámaras y criaturas sorprendentes. Los amigos deben explorar juntos y encontrar la salida.",
    objective: "Encuentra las tres llaves luminosas para abrir la compuerta.",
    lesson: "Trabajar en equipo nos ayuda a resolver problemas difíciles.",
    environment: "ship",
  },
  {
    title: "La batalla de los ejércitos malos",
    scene: "Un ejército de criaturas oscuras amenaza el valle. Los niños protegen a los habitantes con valentía, ingenio y un escudo de luz.",
    objective: "Activa las tres torres de luz para proteger el campamento.",
    lesson: "La bondad, la verdad y la unión son más fuertes que el miedo.",
    environment: "battle",
  },
  {
    title: "La inundación del campamento",
    scene: "El agua sube alrededor de las tiendas. Los amigos ayudan a las familias a llegar a un lugar seguro y reúnen los suministros.",
    objective: "Recoge tres suministros y encuentra el camino elevado.",
    lesson: "Ayudar a otros es una forma de demostrar amor.",
    environment: "flood",
  },
  {
    title: "El bosque peligroso",
    scene: "Un bosque desconocido está lleno de sonidos y animales salvajes. Los niños observan las señales y avanzan sin molestar a los animales.",
    objective: "Encuentra tres señales del sendero y llega al claro seguro.",
    lesson: "La prudencia y el respeto por la creación nos guían.",
    environment: "forest",
  },
  {
    title: "El árbol de los frutos mágicos",
    scene: "En el corazón del bosque aparece un árbol extraordinario. Sus frutos guardan una sorpresa que solo se descubre compartiendo.",
    objective: "Encuentra tres frutos especiales y compártelos con el equipo.",
    lesson: "Compartir lo bueno hace crecer la alegría.",
    environment: "tree",
  },
  {
    title: "La avalancha de las rocas gigantes",
    scene: "Las rocas comienzan a caer desde la montaña. Los tres amigos se mantienen unidos, buscan refugio y ayudan a despejar el sendero.",
    objective: "Activa tres señales de seguridad y alcanza el refugio.",
    lesson: "Podemos pedir ayuda a Dios y también actuar con sabiduría y solidaridad.",
    environment: "avalanche",
  },
];

const sparkPositions: [number, number, number][] = [
  [-5, 1.1, 1],
  [4.5, 1.1, -3],
  [-1, 1.1, -8],
];

type DirectionRef = React.MutableRefObject<[number, number]>;
type Vector3Like = { x: number; y: number; z: number };
type SceneNode = { position: { x: number; y: number; z: number; lerp: (target: Vector3Like, alpha: number) => void; distanceTo: (target: Vector3Like) => number }; rotation: { y: number } };
type KeysRef = React.MutableRefObject<Set<string>>;

function KidModel({
  name,
  shirt,
  hair,
  position,
  scale = 1,
  nodeRef,
}: {
  name: string;
  shirt: string;
  hair: string;
  position: [number, number, number];
  scale?: number;
  nodeRef?: (node: SceneNode | null) => void;
}) {
  const bob = useRef<SceneNode | null>(null);
  useFrame((state) => {
    if (bob.current) {
      bob.current.position.y = Math.sin(state.clock.elapsedTime * 2.5 + position[0]) * 0.045;
    }
  });

  return (
    <group ref={nodeRef} name={name} position={position} scale={scale}>
      <group ref={bob}>
        <mesh position={[0, 1.12, 0]} castShadow>
          <capsuleGeometry args={[0.34, 0.58, 5, 10]} />
          <meshStandardMaterial color={shirt} roughness={0.78} />
        </mesh>
        <mesh position={[0, 1.92, 0]} castShadow>
          <sphereGeometry args={[0.42, 18, 14]} />
          <meshStandardMaterial color="#d99b70" roughness={0.82} />
        </mesh>
        <mesh position={[0, 2.19, -0.035]} castShadow>
          <sphereGeometry args={[0.43, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
          <meshStandardMaterial color={hair} roughness={0.9} />
        </mesh>
        <mesh position={[-0.15, 1.96, 0.36]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#17202b" />
        </mesh>
        <mesh position={[0.15, 1.96, 0.36]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color="#17202b" />
        </mesh>
        <mesh position={[0, 1.81, 0.385]}>
          <sphereGeometry args={[0.07, 8, 6]} />
          <meshStandardMaterial color="#9b5548" />
        </mesh>
        <mesh position={[-0.17, 0.35, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.45, 4, 8]} />
          <meshStandardMaterial color="#334b78" />
        </mesh>
        <mesh position={[0.17, 0.35, 0]} castShadow>
          <capsuleGeometry args={[0.13, 0.45, 4, 8]} />
          <meshStandardMaterial color="#334b78" />
        </mesh>
        <mesh position={[-0.43, 1.12, 0]} rotation={[0, 0, -0.28]} castShadow>
          <capsuleGeometry args={[0.11, 0.48, 4, 8]} />
          <meshStandardMaterial color="#d99b70" />
        </mesh>
        <mesh position={[0.43, 1.12, 0]} rotation={[0, 0, 0.28]} castShadow>
          <capsuleGeometry args={[0.11, 0.48, 4, 8]} />
          <meshStandardMaterial color="#d99b70" />
        </mesh>
        <mesh position={[0, 2.48, 0.02]} castShadow>
          <sphereGeometry args={[0.12, 10, 8]} />
          <meshStandardMaterial color="#f5c95e" metalness={0.1} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function Portal({ position = [0, 0, -9] as [number, number, number] }) {
  const ring = useRef<{ rotation: { z: number } } | null>(null);
  useFrame((_, delta) => {
    if (ring.current) ring.current.rotation.z += delta * 0.18;
  });
  return (
    <group position={position}>
      <mesh position={[0, 2.2, 0]} ref={ring}>
        <torusGeometry args={[1.65, 0.17, 14, 56]} />
        <meshStandardMaterial color="#7de7f0" emissive="#24b9d5" emissiveIntensity={1.3} metalness={0.35} roughness={0.25} />
      </mesh>
      <mesh position={[0, 2.2, -0.08]}>
        <circleGeometry args={[1.55, 48]} />
        <meshBasicMaterial color="#4e3cb0" transparent opacity={0.76} side={THREE.DoubleSide} />
      </mesh>
      <Sparkles count={28} scale={[4.5, 5, 1.2]} size={3} color="#b8faff" />
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 0.35, 24]} />
        <meshStandardMaterial color="#405d78" />
      </mesh>
    </group>
  );
}

function Monster({ position, tint = "#6c648e" }: { position: [number, number, number]; tint?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.48, 0.75, 5, 10]} />
        <meshStandardMaterial color={tint} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshStandardMaterial color={tint} roughness={0.8} />
      </mesh>
      <mesh position={[-0.19, 1.95, 0.48]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshBasicMaterial color="#ffe6a0" />
      </mesh>
      <mesh position={[0.19, 1.95, 0.48]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshBasicMaterial color="#ffe6a0" />
      </mesh>
    </group>
  );
}

function Environment({ environment }: { environment: Chapter["environment"] }) {
  const ground = environment === "flood" ? "#397f9a" : environment === "ship" ? "#3c4b62" : environment === "avalanche" ? "#b8c6d2" : environment === "forest" || environment === "tree" ? "#477b55" : "#6c9c70";
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={ground} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.04, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 34]} />
        <meshStandardMaterial color={environment === "ship" ? "#75869a" : "#c9b58d"} roughness={0.9} />
      </mesh>
      {environment === "portal" && (
        <>
          <mesh position={[0, 3.4, -13]}><boxGeometry args={[10, 6, 0.6]} /><meshStandardMaterial color="#26374d" metalness={0.55} roughness={0.42} /></mesh>
          <mesh position={[0, 3.4, -12.65]}><boxGeometry args={[5.8, 3.5, 0.1]} /><meshBasicMaterial color="#263e75" /></mesh>
          <Monster position={[-3.4, 0, -13]} />
          <Monster position={[3.5, 0, -13]} tint="#8a647d" />
        </>
      )}
      {environment === "ship" && (
        <>
          <mesh position={[0, 3.5, -13]}><boxGeometry args={[22, 7, 1]} /><meshStandardMaterial color="#27374b" metalness={0.6} /></mesh>
          {[-8, -4, 4, 8].map((x) => <mesh key={x} position={[x, 2.8, -8]}><boxGeometry args={[0.35, 5.5, 0.35]} /><meshStandardMaterial color="#92b7ca" emissive="#326e9b" emissiveIntensity={0.6} /></mesh>)}
          <Monster position={[-4, 0, -11]} />
          <Monster position={[4, 0, -13]} tint="#82627e" />
        </>
      )}
      {environment === "battle" && (
        <>
          <mesh position={[0, 0.12, -8]}><boxGeometry args={[18, 0.22, 0.5]} /><meshStandardMaterial color="#e6c76c" emissive="#9d6b23" emissiveIntensity={0.7} /></mesh>
          {[-6, 0, 6].map((x) => <group key={x} position={[x, 0, -8]}><mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.18, 0.4, 3.2, 8]} /><meshStandardMaterial color="#f0d06c" emissive="#b78a24" emissiveIntensity={0.7} /></mesh><mesh position={[0, 3.3, 0]}><sphereGeometry args={[0.45, 12, 10]} /><meshStandardMaterial color="#fff0a4" emissive="#f3c85d" emissiveIntensity={1.3} /></mesh></group>)}
          {[-7, -2, 3, 7].map((x, i) => <Monster key={x} position={[x, 0, -14 - (i % 2) * 2]} tint="#665b82" />)}
        </>
      )}
      {environment === "flood" && (
        <>
          <mesh position={[0, 0.22, -5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[24, 24]} /><meshStandardMaterial color="#4ba9c8" transparent opacity={0.78} roughness={0.25} /></mesh>
          {[-6, 0, 6].map((x) => <group key={x} position={[x, 0, -9]}><mesh position={[0, 1, 0]}><coneGeometry args={[2, 2, 4]} /><meshStandardMaterial color="#e4c17d" /></mesh><mesh position={[0, 0.55, 0]}><boxGeometry args={[2.7, 1.1, 2.4]} /><meshStandardMaterial color="#b87e54" /></mesh></group>)}
        </>
      )}
      {(environment === "forest" || environment === "tree") && (
        <>
          {Array.from({ length: 14 }, (_, i) => {
            const x = -13 + (i % 7) * 4.2;
            const z = -14 + Math.floor(i / 7) * 11;
            return <group key={i} position={[x, 0, z]}><mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.18, 0.28, 2.4, 7]} /><meshStandardMaterial color="#76533a" /></mesh><mesh position={[0, 2.8, 0]}><coneGeometry args={[1.35, 2.5, 8]} /><meshStandardMaterial color={i % 2 ? "#36734d" : "#4e8c54"} /></mesh></group>;
          })}
          {environment === "tree" && <group position={[0, 0, -9]}><mesh position={[0, 2.1, 0]}><cylinderGeometry args={[0.5, 0.85, 4.2, 10]} /><meshStandardMaterial color="#805a39" /></mesh><mesh position={[0, 4.8, 0]}><sphereGeometry args={[2.4, 18, 14]} /><meshStandardMaterial color="#36884c" roughness={0.8} /></mesh>{[-1.3, -0.5, 0.6, 1.3].map((x) => <mesh key={x} position={[x, 4.2 + Math.abs(x) * 0.25, 1.55]}><sphereGeometry args={[0.28, 12, 10]} /><meshStandardMaterial color="#f1b84c" emissive="#b56b18" emissiveIntensity={0.45} /></mesh>)}</group>}
          <Monster position={[7, 0, -10]} tint="#8a765c" />
        </>
      )}
      {environment === "avalanche" && (
        <>
          <mesh position={[0, 4, -15]}><coneGeometry args={[12, 11, 5]} /><meshStandardMaterial color="#8498a9" roughness={0.95} /></mesh>
          {Array.from({ length: 10 }, (_, i) => <mesh key={i} position={[-8 + (i % 5) * 4, 0.7 + (i % 3) * 0.55, -5 - Math.floor(i / 5) * 5]} rotation={[0.3 * i, 0.4 * i, 0.2]}><dodecahedronGeometry args={[0.85 + (i % 3) * 0.3, 0]} /><meshStandardMaterial color="#8494a1" roughness={0.96} /></mesh>)}
          <mesh position={[0, 1.2, -12]}><boxGeometry args={[5, 2.4, 3]} /><meshStandardMaterial color="#8c674b" /></mesh>
        </>
      )}
    </>
  );
}

function GameScene({
  chapter,
  keys,
  pad,
  collected,
  onCollect,
  onNearGate,
  activeChild,
  companions,
}: {
  chapter: Chapter;
  keys: KeysRef;
  pad: DirectionRef;
  collected: number[];
  onCollect: (index: number) => void;
  onNearGate: (near: boolean) => void;
  activeChild: ChildProfile;
  companions: ChildProfile[];
}) {
  const player = useRef<SceneNode | null>(null);
  const friendOne = useRef<SceneNode | null>(null);
  const friendTwo = useRef<SceneNode | null>(null);
  const { camera } = useThree();
  const lastNear = useRef(false);
  const jumpVelocity = useRef(0);
  const jumpWasPressed = useRef(false);

  useFrame((_, delta) => {
    if (!player.current) return;
    const keySet = keys.current;
    const jumpPressed = keySet.has(" ") || keySet.has("space");
    if (jumpPressed && !jumpWasPressed.current && player.current.position.y <= 0.001) jumpVelocity.current = activeChild.jumpForce;
    jumpWasPressed.current = jumpPressed;
    if (player.current.position.y > 0 || jumpVelocity.current > 0) {
      jumpVelocity.current -= 18 * delta;
      player.current.position.y = Math.max(0, player.current.position.y + jumpVelocity.current * delta);
      if (player.current.position.y === 0) jumpVelocity.current = 0;
    }
    const forward = (keySet.has("w") || keySet.has("arrowup") ? 1 : 0) - (keySet.has("s") || keySet.has("arrowdown") ? 1 : 0) + pad.current[1];
    const sideways = (keySet.has("d") || keySet.has("arrowright") ? 1 : 0) - (keySet.has("a") || keySet.has("arrowleft") ? 1 : 0) + pad.current[0];
    const direction = new THREE.Vector2(sideways, forward);
    if (direction.lengthSq() > 0.01) {
      direction.normalize();
      player.current.position.x = THREE.MathUtils.clamp(player.current.position.x + direction.x * delta * activeChild.speed, -13, 13);
      player.current.position.z = THREE.MathUtils.clamp(player.current.position.z - direction.y * delta * activeChild.speed, -17, 13);
      player.current.rotation.y = Math.atan2(direction.x, direction.y);
    }
    const target = new THREE.Vector3(player.current.position.x, 6.4, player.current.position.z + 10);
    camera.position.lerp(target, 1 - Math.pow(0.001, delta));
    camera.lookAt(player.current.position.x, 1.2, player.current.position.z - 1.5);

    const follow = (node: SceneNode | null, xOffset: number, zOffset: number) => {
      if (!node || !player.current) return;
      const p = player.current.position;
      const desired = new THREE.Vector3(p.x + xOffset, 0, p.z + zOffset);
      node.position.lerp(desired, Math.min(1, delta * 3.5));
      node.rotation.y = player.current.rotation.y;
    };
    follow(friendOne.current, -1.3, 1.4);
    follow(friendTwo.current, 1.3, 1.4);

    sparkPositions.forEach((position, index) => {
      if (!collected.includes(index) && player.current && player.current.position.distanceTo(new THREE.Vector3(position[0], 0, position[2])) < 1.65) onCollect(index);
    });
    const near = player.current.position.distanceTo(new THREE.Vector3(0, 0, -9)) < 3.4;
    if (near !== lastNear.current) {
      lastNear.current = near;
      onNearGate(near);
    }
  });

  return (
    <>
      <color attach="background" args={["#9bc9dc"]} />
      <fog attach="fog" args={["#a8c9c5", 25, 55]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[9, 18, 7]} intensity={1.65} castShadow />
      <Environment environment={chapter.environment} />
      <Portal position={[0, 0, -9]} />
      {sparkPositions.map((position, index) => !collected.includes(index) && (
        <Float key={index} speed={1.6} floatIntensity={0.4}>
          <mesh position={position}>
            <icosahedronGeometry args={[0.42, 1]} />
            <meshStandardMaterial color="#fff0a3" emissive="#f2b832" emissiveIntensity={1.5} />
          </mesh>
        </Float>
      ))}
      <KidModel name={activeChild.name} shirt={activeChild.accentColor} hair="#493329" position={[0, 0, 8]} nodeRef={(node) => { player.current = node; }} />
      <KidModel name={companions[0].name} shirt={companions[0].accentColor} hair="#382b35" position={[-1.3, 0, 9.4]} scale={0.94} nodeRef={(node) => { friendOne.current = node; }} />
      <KidModel name={companions[1].name} shirt={companions[1].accentColor} hair="#47372b" position={[1.3, 0, 9.4]} scale={0.96} nodeRef={(node) => { friendTwo.current = node; }} />
      <Sparkles count={70} scale={[28, 7, 32]} color="#fff1ba" />
    </>
  );
}

export function ThreeChildrenPortalsGame() {
  const keys = useRef(new Set<string>());
  const pad = useRef<[number, number]>([0, 0]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const activeChild = useGameStore((state) => state.childrenData[state.activeChildIndex]);
  const childrenData = useGameStore((state) => state.childrenData);
  const faith = useGameStore((state) => state.faith);
  const isPraying = useGameStore((state) => state.isPraying);
  const guidanceMessage = useGameStore((state) => state.guidanceMessage);
  const inventory = useGameStore((state) => state.inventory);
  const switchChild = useGameStore((state) => state.switchChild);
  const triggerPrayer = useGameStore((state) => state.triggerPrayer);
  const restoreFaith = useGameStore((state) => state.restoreFaith);
  const addItem = useGameStore((state) => state.addItem);
  const setMissionProgress = useGameStore((state) => state.setMissionProgress);
  const setStoredChapter = useGameStore((state) => state.setChapter);
  const hydrateStore = useGameStore((state) => state.hydrate);
  const [collected, setCollected] = useState<number[]>([]);
  const collectedRef = useRef<number[]>([]);
  const [nearGate, setNearGate] = useState(false);
  const advancingRef = useRef(false);
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState("");
  const { result, finish, resetCompletion, saveGameProgress } = useGameCompletion("three-children-portals");

  useEffect(() => {
    hydrateStore();
    const storedChapter = getGameStoreState().currentChapter;
    setChapterIndex(storedChapter - 1);
    try {
      const saved = localStorage.getItem("av-three-children-portals");
      if (saved) {
        const parsed = JSON.parse(saved) as { chapter?: number };
        if (typeof parsed.chapter === "number" && parsed.chapter >= 0 && parsed.chapter < chapters.length) setChapterIndex(parsed.chapter);
      }
    } catch {
      // El juego comienza desde el primer capítulo si el guardado no es legible.
    }
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) event.preventDefault();
      keys.current.add(key);
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [hydrateStore]);

  const current = chapters[chapterIndex];

  const collect = (index: number) => {
    if (collectedRef.current.includes(index)) return;
    const next = [...collectedRef.current, index];
    collectedRef.current = next;
    setCollected(next);
    setMissionProgress(next.length);
    restoreFaith(5);
    addItem("Señal de luz " + (index + 1));
    setMessage("¡Encontraste una señal! Los tres amigos avanzan juntos y recuperan ánimo.");
  };

  const prayerCost = Math.ceil(20 / activeChild.prayerBonus);

  const askGodForHelp = () => {
    triggerPrayer("Los amigos oran: «Dios, danos sabiduría, valentía y amor para ayudarnos unos a otros. Amén». " + CHAPTER_GUIDANCE[chapterIndex + 1]);
  };

  const advance = () => {
    if (advancingRef.current || collected.length < 3 || !nearGate) return;
    advancingRef.current = true;
    if (chapterIndex === chapters.length - 1) {
      const completedChapters = chapters.map((_, index) => index + 1);
      saveGameProgress("three-children-portals", { chapter: 7, completedChapters, completed: true, completedAt: new Date().toISOString() });
      try {
        localStorage.setItem("av-three-children-portals", JSON.stringify({ chapter: 0, completed: true }));
      } catch {}
      finish({ points: 700, xp: 280 });
      return;
    }
    const next = chapterIndex + 1;
    setStoredChapter(next + 1);
    const completedChapters = chapters.slice(0, next).map((_, index) => index + 1);
    saveGameProgress("three-children-portals", { chapter: next + 1, completedChapters, completed: false, updatedAt: new Date().toISOString() });
    setChapterIndex(next);
    collectedRef.current = [];
    setCollected([]);
    setNearGate(false);
    setMessage("¡Capítulo completado! Los amigos descubren una nueva zona.");
    try {
      localStorage.setItem("av-three-children-portals", JSON.stringify({ chapter: next, completed: false }));
    } catch {}
  };

  useEffect(() => {
    advancingRef.current = false;
  }, [chapterIndex]);

  useEffect(() => {
    if (started && nearGate && collected.length >= 3) advance();
  }, [started, nearGate, collected.length, chapterIndex, advance]);

  const replay = () => {
    advancingRef.current = false;
    setChapterIndex(0);
    setStoredChapter(1);
    setMissionProgress(0);
    collectedRef.current = [];
    setCollected([]);
    saveGameProgress("three-children-portals", { chapter: 1, completedChapters: [], completed: false, updatedAt: new Date().toISOString() });
    setNearGate(false);
    setStarted(false);
    setMessage("");
    resetCompletion();
    try {
      localStorage.setItem("av-three-children-portals", JSON.stringify({ chapter: 0, completed: false }));
    } catch {}
  };

  if (result) {
    return (
      <VictoryPanel
        title="¡Los tres amigos lo lograron!"
        description="Completaste los siete capítulos. La fe, la amistad, la prudencia y la ayuda mutua guiaron esta aventura."
        result={result}
        points={700}
        xp={280}
        onPlayAgain={replay}
      />
    );
  }

  const holdJump = (pressed: boolean) => {
    if (pressed) keys.current.add(" ");
    else keys.current.delete(" ");
  };

  const holdDirection = (x: number, y: number) => {
    pad.current = [x, y];
  };

  return (
    <div className="mt-6 overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#071e2b] text-white shadow-2xl">
      <div className="grid gap-4 border-b border-white/10 bg-[#0a2b3a] p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#f5cf74]">Aventura original · 7 capítulos</p>
          <h2 className="mt-1 font-display text-2xl font-black text-white">{current.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">{current.scene}</p>
        </div>
        <div className="rounded-2xl bg-white/5 p-3 text-sm">
          <p className="font-black text-[#f5cf74]">Capítulo {chapterIndex + 1} / 7</p>
          <p className="mt-1 text-xs text-white/65">Señales: {collected.length} / 3</p>
          <p className="mt-1 text-xs text-white/65">Fe: {faith} / 100</p>
          <div className="mt-2 h-2 w-36 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#f5cf74] transition-all" style={{ width: ((collected.length / 3) * 100) + "%" }} /></div>
        </div>
      </div>

      <div className="relative h-[min(68vh,620px)] min-h-[440px]">
        <Canvas shadows camera={{ position: [0, 7, 19], fov: 48 }} dpr={[1, 1.5]}>
          <GameScene key={chapterIndex} chapter={current} keys={keys} pad={pad} collected={collected} onCollect={collect} onNearGate={setNearGate} activeChild={activeChild} companions={childrenData.filter((child) => child.id !== activeChild.id)} />
        </Canvas>

        {!started && (
          <div className="absolute inset-0 grid place-items-center bg-[#061925]/65 p-5 backdrop-blur-sm">
            <div className="max-w-md rounded-3xl border border-white/15 bg-[#0b2d3d]/95 p-6 text-center shadow-2xl">
              <p className="text-xs font-black uppercase tracking-[.2em] text-[#f5cf74]">Una aventura de fe y amistad</p>
              <h3 className="mt-3 font-display text-3xl font-black">Tres niños y los portales poderosos</h3>
              <p className="mt-3 text-sm leading-6 text-white/70">Explora con Mateo, Sofía y Lucas. Muévete, encuentra las señales y ayuda al equipo a llegar al siguiente capítulo.</p>
              <button type="button" onClick={() => setStarted(true)} className="mt-5 rounded-xl bg-[#f5cf74] px-6 py-3 text-sm font-black text-[#203142]">Entrar en la aventura</button>
            </div>
          </div>
        )}

        <div className="absolute right-3 top-3 rounded-xl border border-white/10 bg-[#071e2b]/90 p-2 text-xs shadow-lg">
          <p className="mb-1 font-black text-[#f5cf74]">Equipo</p>
          <div className="flex gap-1">{[0, 1, 2].map((index) => {
            const child = childrenData[index];
            return <button key={child.id} type="button" onClick={() => switchChild(index)} aria-pressed={activeChild.id === child.id} className="rounded-lg px-2 py-1 font-bold" style={{ backgroundColor: activeChild.id === child.id ? child.accentColor : "rgba(255,255,255,.1)" }}>{child.name}</button>;
          })}</div>
          <p className="mt-1 max-w-48 text-[10px] text-white/60">{activeChild.role} · Velocidad {activeChild.speed} · Salto {activeChild.jumpForce}</p>
          <p className="mt-1 max-w-48 text-[10px] text-white/60">Mochila: {inventory.length} objetos</p>
        </div>

        <div className="absolute left-3 top-3 rounded-xl border border-white/10 bg-[#071e2b]/85 p-3 text-xs shadow-lg">
          <p className="font-black text-[#f5cf74]">Objetivo</p>
          <p className="mt-1 max-w-52 leading-5 text-white/80">{current.objective}</p>
          <p className="mt-1 max-w-52 leading-5 text-[#f5cf74]">{CHAPTER_GUIDANCE[chapterIndex + 1]}</p>
          <p className="mt-2 text-[10px] text-white/55">WASD / flechas o controles táctiles</p>
        </div>

        <div className="absolute bottom-3 left-3 grid grid-cols-3 gap-1.5 sm:bottom-4 sm:left-4">
          <span />
          <button type="button" aria-label="Avanzar" onPointerDown={() => holdDirection(0, 1)} onPointerUp={() => holdDirection(0, 0)} onPointerLeave={() => holdDirection(0, 0)} className="h-11 w-11 rounded-xl border border-white/15 bg-[#0a2b3a]/90 text-lg font-black">↑</button>
          <span />
          <button type="button" aria-label="Mover a la izquierda" onPointerDown={() => holdDirection(-1, 0)} onPointerUp={() => holdDirection(0, 0)} onPointerLeave={() => holdDirection(0, 0)} className="h-11 w-11 rounded-xl border border-white/15 bg-[#0a2b3a]/90 text-lg font-black">←</button>
          <button type="button" aria-label="Retroceder" onPointerDown={() => holdDirection(0, -1)} onPointerUp={() => holdDirection(0, 0)} onPointerLeave={() => holdDirection(0, 0)} className="h-11 w-11 rounded-xl border border-white/15 bg-[#0a2b3a]/90 text-lg font-black">↓</button>
          <button type="button" aria-label="Mover a la derecha" onPointerDown={() => holdDirection(1, 0)} onPointerUp={() => holdDirection(0, 0)} onPointerLeave={() => holdDirection(0, 0)} className="h-11 w-11 rounded-xl border border-white/15 bg-[#0a2b3a]/90 text-lg font-black">→</button>
          <button type="button" aria-label="Saltar" onPointerDown={() => holdJump(true)} onPointerUp={() => holdJump(false)} onPointerLeave={() => holdJump(false)} className="col-span-3 mt-1 h-10 rounded-xl border border-white/15 bg-[#0a2b3a]/90 text-xs font-black">SALTAR</button>
        </div>

        <div className="absolute bottom-4 right-3 flex max-w-[58%] flex-col items-end gap-2 sm:right-4">
          <button type="button" disabled={isPraying || faith < prayerCost} onClick={askGodForHelp} className="rounded-xl border border-[#f5cf74]/50 bg-[#142f3c]/95 px-3 py-2 text-xs font-black text-[#f5cf74] shadow-lg disabled:opacity-50">{isPraying ? "Orando…" : "Orar y pedir ayuda a Dios"} · {prayerCost} fe</button>
          {nearGate && (
            <button type="button" disabled={collected.length < 3} onClick={advance} className="rounded-xl bg-[#f5cf74] px-4 py-3 text-xs font-black text-[#203142] shadow-lg disabled:cursor-not-allowed disabled:opacity-50">
              {collected.length < 3 ? "Busca las 3 señales" : "Portal activado…"}
            </button>
          )}
        </div>

        {(message || guidanceMessage) && <div role="status" className="absolute left-1/2 top-20 w-[min(90%,480px)] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#082b3b]/95 p-3 text-center text-xs leading-5 text-white shadow-xl">{guidanceMessage || message}<button type="button" onClick={() => setMessage("")} className="ml-2 font-black text-[#f5cf74] underline">Cerrar</button></div>}
      </div>

      <div className="grid gap-3 border-t border-white/10 bg-[#061925] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#7bd8cf]">Enseñanza del capítulo</p>
          <p className="mt-1 text-sm text-white/75">{current.lesson}</p>
          <p className="mt-1 text-xs text-white/50">Personaje activo: {activeChild.name} · Mochila: {inventory.length} objetos</p>
        </div>
        <p className="text-xs font-bold text-white/50">Personajes 3D geométricos · sin imágenes planas</p>
      </div>
    </div>
  );
}
