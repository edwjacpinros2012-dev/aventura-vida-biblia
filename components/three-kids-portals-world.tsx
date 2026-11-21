"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Text, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { officialCharacters } from "@/lib/characters/catalog";
import { getPlayerProfile, selectAvatar, completeChapter } from "@/lib/portales/progress-store";
import type { ExistingAvatarId } from "@/lib/portales/types";

const AVATARS = officialCharacters.filter(character => character.status === "active").map(character => ({ id: character.id as ExistingAvatarId, label: character.name, image: character.asset }));

const CHAPTERS = [
  { title: "El portal misterioso", detail: "Descubren el portal y una nave llena de criaturas.", available: true, icon: "🌀" },
  { title: "La nave de los monstruos", detail: "Explora la nave, resuelve acertijos y ayuda a las criaturas.", available: false, icon: "🚀" },
  { title: "La batalla de los ejércitos", detail: "Una aventura de estrategia, escudos y rescate en equipo.", available: false, icon: "🛡️" },
  { title: "El campamento inundado", detail: "Encuentra rutas seguras y ayuda a evacuar el campamento.", available: false, icon: "🌊" },
  { title: "El bosque peligroso", detail: "Busca el camino, cuida a los animales y reúne al equipo.", available: false, icon: "🌲" },
  { title: "El árbol de los frutos mágicos", detail: "Descubre frutos de colores y sus acertijos de sabiduría.", available: false, icon: "🍎" },
  { title: "La avalancha de rocas gigantes", detail: "Usa observación, cooperación y refugios para llegar a salvo.", available: false, icon: "⛰️" },
] as const;

type Stage = "portal" | "ship";
type Vec3 = [number, number, number];

function AvatarBillboard({ image, position, scale = 1 }: { image: string; position: Vec3; scale?: number }) {
  const texture = useTexture(image);
  const mesh = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  useMemo(() => { texture.colorSpace = THREE.SRGBColorSpace; texture.needsUpdate = true; }, [texture]);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.lookAt(camera.position.x, mesh.current.position.y, camera.position.z);
    mesh.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2.4 + position[0]) * 0.045;
  });
  return <mesh ref={mesh} position={position} scale={[1.25 * scale, 2.15 * scale, 1]} castShadow>
    <planeGeometry args={[1, 1]} />
    <meshBasicMaterial map={texture} transparent alphaTest={0.04} side={THREE.DoubleSide} depthWrite={false} />
  </mesh>;
}

function Orb({ position, index, onCollect }: { position: Vec3; index: number; onCollect: (index: number) => void }) {
  const orb = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { if (orb.current) { orb.current.rotation.y = clock.elapsedTime * 1.2; orb.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2.6 + index) * 0.15; } });
  return <Float speed={2} floatIntensity={0.25}><mesh ref={orb} position={position} onClick={() => onCollect(index)}><dodecahedronGeometry args={[0.32, 0]} /><meshStandardMaterial color="#ffe58b" emissive="#ffb000" emissiveIntensity={1.4} metalness={0.35} /></mesh></Float>;
}

function Portal({ open, position = [0, 0, -9] }: { open: boolean; position?: Vec3 }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => { if (ring.current) { ring.current.rotation.z = Math.sin(clock.elapsedTime * 0.5) * 0.04; ring.current.rotation.y = clock.elapsedTime * 0.18; } });
  return <group position={position}>
    <mesh position={[0, 2.2, 0]} ref={ring}><torusGeometry args={[1.65, 0.2, 12, 64]} /><meshStandardMaterial color={open ? "#78f5d8" : "#8672ff"} emissive={open ? "#27d8b3" : "#6d55f2"} emissiveIntensity={open ? 2.2 : 1.3} metalness={0.55} /></mesh>
    <mesh position={[0, 2.2, -0.05]}><circleGeometry args={[1.5, 48]} /><meshBasicMaterial color={open ? "#16b8a0" : "#3a226d"} transparent opacity={0.45} /></mesh>
    <Sparkles position={[0, 2.2, 0]} count={open ? 55 : 24} scale={[4, 4, 1]} color={open ? "#98ffdf" : "#c6b6ff"} size={3} />
  </group>;
}

function Environment({ stage, selected, companions, keys, pad, collected, collect, setNearPortal, nearPortal, onRescue, rescued, setNearCreature, nearCreature }: {
  stage: Stage; selected: typeof AVATARS[number]; companions: typeof AVATARS[number][]; keys: React.MutableRefObject<Set<string>>; pad: React.MutableRefObject<[number, number]>;
  collected: number[]; collect: (index: number) => void; setNearPortal: (near: boolean) => void; nearPortal: boolean; onRescue: () => void; rescued: boolean; setNearCreature: (near: boolean) => void; nearCreature: boolean;
}) {
  const player = useRef<THREE.Group>(null);
  const friendA = useRef<THREE.Group>(null);
  const friendB = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const lights = stage === "portal" ? [[-5, 0.7, -3], [5, 0.7, -7], [0, 0.7, 4]] as Vec3[] : [[-4, 0.8, -3], [4, 0.8, -5], [0, 0.8, -9]] as Vec3[];
  useFrame((_, delta) => {
    const p = player.current;
    if (!p) return;
    const k = keys.current;
    const x = Number(k.has("d") || k.has("arrowright")) - Number(k.has("a") || k.has("arrowleft")) + pad.current[0];
    const z = Number(k.has("s") || k.has("arrowdown")) - Number(k.has("w") || k.has("arrowup")) + pad.current[1];
    const direction = new THREE.Vector2(x, z);
    if (direction.lengthSq() > 0.01) {
      direction.normalize();
      p.position.x = THREE.MathUtils.clamp(p.position.x + direction.x * delta * 4.6, -12, 12);
      p.position.z = THREE.MathUtils.clamp(p.position.z + direction.y * delta * 4.6, -14, 14);
      p.rotation.y = Math.atan2(direction.x, direction.y);
    }
    camera.position.lerp(new THREE.Vector3(p.position.x, 5.6, p.position.z + 8.5), 1 - Math.pow(0.001, delta));
    camera.lookAt(p.position.x, 1, p.position.z - 1);
    if (friendA.current) friendA.current.position.lerp(new THREE.Vector3(p.position.x - 1.7, 0, p.position.z + 1.2), Math.min(1, delta * 2.2));
    if (friendB.current) friendB.current.position.lerp(new THREE.Vector3(p.position.x + 1.7, 0, p.position.z + 2.2), Math.min(1, delta * 1.8));
    if (stage === "portal") {
      const near = Math.hypot(p.position.x, p.position.z + 9) < 3.3;
      if (near !== nearPortal) setNearPortal(near);
    } else {
      const near = Math.hypot(p.position.x - 4.2, p.position.z + 5.8) < 2.4;
      if (near !== nearCreature) setNearCreature(near);
    }
  });
  return <>
    <color attach="background" args={[stage === "portal" ? "#07162c" : "#101c30"]} />
    <fog attach="fog" args={[stage === "portal" ? "#132b4a" : "#172238", 18, 38]} />
    <ambientLight intensity={1.1} />
    <directionalLight position={[7, 12, 6]} intensity={2.2} castShadow />
    <pointLight position={[0, 3, -9]} color={stage === "portal" ? "#7867ff" : "#5fe3ff"} intensity={12} distance={16} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow><planeGeometry args={[60, 60]} /><meshStandardMaterial color={stage === "portal" ? "#243b58" : "#273349"} roughness={0.9} /></mesh>
    {Array.from({ length: 18 }, (_, i) => <mesh key={i} position={[-13 + (i % 6) * 5.2, 1 + (i % 3) * 0.4, -13 + Math.floor(i / 6) * 11]} rotation={[0, (i % 2) * 0.3, 0]} castShadow><boxGeometry args={[2.4, 2.5, 2.2]} /><meshStandardMaterial color={stage === "portal" ? ["#273c60", "#34496b", "#263853"][i % 3] : ["#2c425b", "#33465f", "#27374e"][i % 3]} /></mesh>)}
    {stage === "portal" ? <>
      <mesh position={[0, 0.03, -5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4, 30]} /><meshStandardMaterial color="#6d6a84" /></mesh>
      <Portal open={collected.length === 3} />
      {lights.map((position, index) => !collected.includes(index) && <Orb key={index} position={position} index={index} onCollect={collect} />)}
      <Text position={[0, 5.1, -9]} fontSize={0.7} color="#e5dcff" anchorX="center">PORTAL DE ESPERANZA</Text>
    </> : <>
      <mesh position={[0, 0.15, -6]}><boxGeometry args={[18, 0.3, 20]} /><meshStandardMaterial color="#4a5369" metalness={0.45} /></mesh>
      {Array.from({ length: 9 }, (_, i) => <group key={i} position={[-7 + (i % 3) * 7, 0, -12 + Math.floor(i / 3) * 6]}><mesh position={[0, 1.8, 0]}><boxGeometry args={[0.6, 3.6, 0.6]} /><meshStandardMaterial color="#6e8196" metalness={0.6} /></mesh><mesh position={[0, 3.65, 0]}><sphereGeometry args={[0.6, 16, 12]} /><meshStandardMaterial color="#57cbe5" emissive="#1c8fb5" emissiveIntensity={1.5} /></mesh></group>)}
      <group position={[4.2, 0, -5.8]}><mesh position={[0, 1.1, 0]}><sphereGeometry args={[0.9, 16, 12]} /><meshStandardMaterial color="#a5d7c2" /></mesh><mesh position={[0, 2.1, 0]}><sphereGeometry args={[0.65, 16, 12]} /><meshStandardMaterial color="#b4e8cf" /></mesh><mesh position={[-0.3, 2.2, 0.5]}><sphereGeometry args={[0.08, 8, 8]} /><meshBasicMaterial color="#142338" /></mesh><mesh position={[0.3, 2.2, 0.5]}><sphereGeometry args={[0.08, 8, 8]} /><meshBasicMaterial color="#142338" /></mesh></group>
      {!rescued && lights.map((position, index) => !collected.includes(index) && <Orb key={index} position={position} index={index} onCollect={collect} />)}
      <Text position={[0, 5.5, -13]} fontSize={0.65} color="#a7e7ff" anchorX="center">NAVE DE LAS CRIATURAS</Text>
    </>}
    <group ref={player} position={[0, 0, 8]}><AvatarBillboard image={selected.image} position={[0, 1.25, 0]} scale={1.1} /></group>
    <group ref={friendA} position={[-2, 0, 10]}><AvatarBillboard image={companions[0].image} position={[0, 1.1, 0]} scale={0.9} /></group>
    <group ref={friendB} position={[2, 0, 11]}><AvatarBillboard image={companions[1].image} position={[0, 1.1, 0]} scale={0.9} /></group>
    <Sparkles count={45} scale={[22, 8, 24]} color="#b9ddff" size={2} />
  </>;
}

function HoldButton({ label, x, z, pad }: { label: string; x: number; z: number; pad: React.MutableRefObject<[number, number]> }) {
  const active = useRef(false);
  const set = (down: boolean) => { active.current = down; pad.current = down ? [x, z] : [0, 0]; };
  return <button aria-label={label} onPointerDown={(e) => { e.preventDefault(); set(true); }} onPointerUp={() => set(false)} onPointerLeave={() => set(false)} onPointerCancel={() => set(false)} className="touch-none select-none rounded-xl border border-white/20 bg-slate-900/75 px-4 py-3 font-black text-white shadow-lg active:bg-teal-400 active:text-slate-900">{label}</button>;
}

export default function ThreeKidsPortalsWorld() {
  const keys = useRef(new Set<string>());
  const pad = useRef<[number, number]>([0, 0]);
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0]?.id ?? "vida-kids-01-rosa-morado");
  const [stage, setStage] = useState<Stage>("portal");
  const [collected, setCollected] = useState<number[]>([]);
  const [nearPortal, setNearPortal] = useState(false);
  const [nearCreature, setNearCreature] = useState(false);
  const [rescued, setRescued] = useState(false);
  const [message, setMessage] = useState("Los tres amigos han llegado al claro. ¡Exploren y reúnan las tres luces!");
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const selected = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0];
  const companions = AVATARS.filter(a => a.id !== selected.id).slice(0, 2);
  const progress = stage === "portal" ? collected.length : rescued ? 3 : collected.length;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("av-portales-avatar");
      if (saved && AVATARS.some(a => a.id === saved)) setAvatarId(saved);
      const savedProgress = localStorage.getItem("av-portales-chapter1");
      if (savedProgress === "ship-rescued") { setStage("ship"); setRescued(true); setCollected([0,1,2]); }
    } catch {}
    const down = (e: KeyboardEvent) => { const key = e.key.toLowerCase(); keys.current.add(key); if (["arrowup","arrowdown","arrowleft","arrowright"," "].includes(key)) e.preventDefault(); if (key === "e") interact(); };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [stage, nearPortal, nearCreature, collected, rescued]);

  const pray = () => setMessage(stage === "portal" ? "Los tres amigos hacen una pausa, dan gracias a Dios y piden sabiduría y valor para ayudar a quien lo necesite." : "Los amigos oran juntos, agradecen por estar a salvo y piden sabiduría para liberar a la criatura con bondad.");
  const collect = (index: number) => setCollected(old => {
    if (old.includes(index)) return old;
    const next = [...old, index];
    setMessage(stage === "portal" ? "¡Encontraron una luz! Los tres amigos se animan y continúan juntos." : "¡Cristal de energía encontrado! La nave se ilumina un poco más.");
    return next;
  });
  function interact() {
    if (stage === "portal" && nearPortal) {
      if (collected.length < 3) { setMessage("El portal necesita tres luces. ¡Sigan explorando juntos!"); return; }
      completeChapter("portal"); setStage("ship"); setCollected([]); setNearPortal(false); setMessage("¡Entraron a la nave! Una criatura amistosa está atrapada. Reúne los cristales y busca cómo liberarla."); return;
    }
    if (stage === "ship" && nearCreature) {
      if (collected.length < 3) { setMessage("La cápsula de rescate necesita tres cristales de energía. Busca las luces de la nave."); return; }
      setRescued(true); setMessage("¡Rescate completado! Los tres niños ayudaron a la criatura y descubrieron que la bondad y el trabajo en equipo pueden vencer al miedo."); try { localStorage.setItem("av-portales-chapter1", "ship-rescued"); } catch {}\n      completeChapter("ship");
      return;
    }
    setMessage(stage === "portal" ? "Explora el claro y toca las luces doradas para recogerlas." : "Explora la nave y reúne los cristales de energía.");
  }
  return <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#071526] shadow-2xl">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0b1c31] p-4 text-white">
      <div><p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">Aventura de la Fe · prototipo jugable</p><h2 className="text-xl font-black sm:text-2xl">Los 3 niños y los portales poderosos</h2></div>
      <button onClick={() => setChaptersOpen(v => !v)} className="rounded-xl border border-white/15 px-3 py-2 text-sm font-bold hover:bg-white/10">Capítulos · 1/7</button>
    </div>
    {chaptersOpen && <div className="grid gap-2 border-b border-white/10 bg-[#091a2b] p-3 sm:grid-cols-2 lg:grid-cols-3">{CHAPTERS.map((c,i)=><div key={c.title} className={`rounded-xl border p-3 ${c.available ? "border-teal-300/40 bg-teal-300/10" : "border-white/10 bg-white/[.03] opacity-70"}`}><p className="text-lg">{c.icon} <span className="text-xs font-black">{i+1}. {c.title}</span></p><p className="mt-1 text-xs text-white/60">{c.detail}</p><p className="mt-2 text-[10px] font-bold uppercase tracking-wider">{c.available ? "Disponible" : "Próximamente"}</p></div>)}</div>}
    <div className="relative h-[min(68vh,640px)] min-h-[440px]">
      <Canvas shadows camera={{ position: [0, 5.6, 17], fov: 48 }} dpr={[1, 1.5]}><Suspense fallback={null}><Environment stage={stage} selected={selected} companions={companions} keys={keys} pad={pad} collected={collected} collect={collect} setNearPortal={setNearPortal} nearPortal={nearPortal} onRescue={() => {}} rescued={rescued} setNearCreature={setNearCreature} nearCreature={nearCreature} /></Suspense></Canvas>
      <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-2xl border border-white/10 bg-slate-950/75 p-3 text-white backdrop-blur"><p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Capítulo 1 · {stage === "portal" ? "El portal misterioso" : "Nave de los monstruos"}</p><p className="mt-1 text-sm font-bold">{stage === "portal" ? "Reúne las tres luces" : rescued ? "Criatura rescatada" : "Rescata a la criatura amistosa"}</p><div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-amber-300 transition-all" style={{width: `${Math.min(100,progress/3*100)}%`}} /></div><p className="mt-1 text-xs text-white/65">{stage === "portal" ? collected.length : rescued ? 3 : collected.length}/3</p></div>
      <div className="absolute right-3 top-3 rounded-xl bg-slate-950/70 p-2 text-xs text-white/80"><span className="font-black">WASD</span> / flechas · <span className="font-black">E</span> interactuar</div>
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2"><div className="max-w-[70%] rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-xs leading-5 text-white/90">{message}</div><div className="grid grid-cols-3 gap-1 sm:hidden"><span/><HoldButton label="↑" x={0} z={-1} pad={pad}/><span/><HoldButton label="←" x={-1} z={0} pad={pad}/><HoldButton label="↓" x={0} z={1} pad={pad}/><HoldButton label="→" x={1} z={0} pad={pad}/></div></div>
      {(nearPortal || nearCreature) && <button onClick={interact} className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg">{stage === "portal" ? collected.length === 3 ? "Entrar al portal · E" : "Portal · faltan luces" : rescued ? "Rescate completado" : collected.length === 3 ? "Liberar criatura · E" : "Cápsula · faltan cristales"}</button>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#081a2b] p-3 text-xs text-white/65"><label className="flex items-center gap-2"><span className="font-bold">Avatar que controlas:</span><select value={avatarId} onChange={e=>{setAvatarId(e.target.value);selectAvatar(e.target.value as ExistingAvatarId)}} className="rounded-lg border border-white/15 bg-slate-900 px-2 py-2 text-white">{AVATARS.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}</select></label><button type="button" onClick={pray} className="rounded-xl border border-amber-200/30 bg-amber-200/10 px-3 py-2 font-bold text-amber-100 hover:bg-amber-200/20">🙏 Orar juntos</button><p>Usa los seis avatares oficiales existentes. No se crean personajes nuevos.</p></div>
  </div>;
}
