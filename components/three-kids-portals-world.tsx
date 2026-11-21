"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Text, useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { officialCharacters } from "@/lib/characters/catalog";
import { getPlayerProfile, selectAvatar, completeChapter } from "@/lib/portales/progress-store";
import type { ExistingAvatarId } from "@/lib/portales/types";

const AVATARS = officialCharacters.filter(character => character.status === "active").map(character => ({ id: character.id as ExistingAvatarId, label: character.name, image: character.asset }));

type ChapterStage = "portal" | "ship" | "armies" | "flood" | "forest" | "fruit-tree" | "rock-avalanche";
type Stage = ChapterStage;

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

const CHAPTERS = [
 {id:"portal",title:"El portal misterioso",detail:"Reúne luces y activa el portal.",icon:"🌀"},
 {id:"ship",title:"La nave de los monstruos",detail:"Encuentra cristales y libera una criatura amigable.",icon:"🚀"},
 {id:"armies",title:"La batalla de los ejércitos",detail:"Resuelve la misión con escudos, estrategia y protección.",icon:"🛡️"},
 {id:"flood",title:"El campamento inundado",detail:"Reúne suministros y guía al campamento a terreno elevado.",icon:"🌊"},
 {id:"forest",title:"El bosque peligroso",detail:"Sigue pistas, encuentra el camino y cuida a los animales.",icon:"🌲"},
 {id:"fruit-tree",title:"El árbol de los frutos mágicos",detail:"Recoge frutos y resuelve acertijos de sabiduría.",icon:"🍎"},
 {id:"rock-avalanche",title:"La avalancha de rocas gigantes",detail:"Encuentra refugios y cruza por una ruta segura.",icon:"⛰️"}
] as const;
const STAGES: ChapterStage[] = ["portal","ship","armies","flood","forest","fruit-tree","rock-avalanche"];
const GENERIC_COLLECTIBLES: Vec3[] = [[-6,0.8,-3],[6,0.8,-7],[0,0.8,4]];
function GenericChapterScene({chapter,selected,companions,keys,pad,collected,collect,nearGoal,setNearGoal}:{chapter:ChapterStage;selected:typeof AVATARS[number];companions:typeof AVATARS[number][];keys:React.MutableRefObject<Set<string>>;pad:React.MutableRefObject<[number,number]>;collected:number[];collect:(i:number)=>void;nearGoal:boolean;setNearGoal:(v:boolean)=>void}){
 const player=useRef<THREE.Group>(null);const a=useRef<THREE.Group>(null);const b=useRef<THREE.Group>(null);const {camera}=useThree();
 useFrame((_,delta)=>{const p=player.current;if(!p)return;const k=keys.current;const x=Number(k.has("d")||k.has("arrowright"))-Number(k.has("a")||k.has("arrowleft"))+pad.current[0];const z=Number(k.has("s")||k.has("arrowdown"))-Number(k.has("w")||k.has("arrowup"))+pad.current[1];const d=new THREE.Vector2(x,z);if(d.lengthSq()>0.01){d.normalize();p.position.x=THREE.MathUtils.clamp(p.position.x+d.x*delta*4.6,-12,12);p.position.z=THREE.MathUtils.clamp(p.position.z+d.y*delta*4.6,-14,14);p.rotation.y=Math.atan2(d.x,d.y);}camera.position.lerp(new THREE.Vector3(p.position.x,5.6,p.position.z+8.5),1-Math.pow(0.001,delta));camera.lookAt(p.position.x,1,p.position.z-1);if(a.current)a.current.position.lerp(new THREE.Vector3(p.position.x-1.7,0,p.position.z+1.2),Math.min(1,delta*2.2));if(b.current)b.current.position.lerp(new THREE.Vector3(p.position.x+1.7,0,p.position.z+2.2),Math.min(1,delta*1.8));const near=Math.hypot(p.position.x,p.position.z+9)<3.3;if(near!==nearGoal)setNearGoal(near);});
 const label=CHAPTERS[STAGES.indexOf(chapter)].title;
 return <>
 <color attach="background" args={[chapter==="flood"?"#163c58":chapter==="forest"?"#153626":chapter==="fruit-tree"?"#24452b":chapter==="rock-avalanche"?"#38414b":"#17263b"]}/>
 <fog attach="fog" args={[chapter==="flood"?"#24546e":chapter==="forest"?"#244532":"#26364b",18,38]}/>
 <ambientLight intensity={1.1}/><directionalLight position={[7,12,6]} intensity={2.1} castShadow/><pointLight position={[0,4,-9]} color="#8bd9ff" intensity={8} distance={18}/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.1,0]} receiveShadow><planeGeometry args={[60,60]}/><meshStandardMaterial color={chapter==="flood"?"#2876a4":chapter==="forest"?"#245b38":chapter==="fruit-tree"?"#385c36":chapter==="rock-avalanche"?"#737c86":"#3a485d"}/></mesh>
 {chapter==="armies"&&<group>{[-7,7].map((x,i)=><group key={i} position={[x,0,-4]}><mesh position={[0,1.2,0]}><boxGeometry args={[5,2.4,2.4]}/><meshStandardMaterial color={i?"#957750":"#54749a"}/></mesh><mesh position={[0,2.8,0]}><boxGeometry args={[1.5,1.2,0.4]}/><meshStandardMaterial color="#c5d4e6"/></mesh></group>)}<Text position={[0,4,-9]} fontSize={.6} anchorX="center" color="#fff">REFUGIOS Y ESTRATEGIA</Text></group>}
 {chapter==="flood"&&<group>{[-8,-4,0,4,8].map(x=><mesh key={x} position={[x,.45,1]}><boxGeometry args={[2.5,.8,3]}/><meshStandardMaterial color="#987d57"/></mesh>)}</group>}
 {chapter==="forest"&&Array.from({length:22},(_,i)=><group key={i} position={[-13+(i%6)*5.2,0,-14+Math.floor(i/6)*7]}><mesh position={[0,1.5,0]}><cylinderGeometry args={[.35,.55,3,8]}/><meshStandardMaterial color="#72543c"/></mesh><mesh position={[0,3.5,0]}><coneGeometry args={[1.6,3.5,8]}/><meshStandardMaterial color="#27714a"/></mesh></group>))}
 {chapter==="fruit-tree"&&<group position={[0,0,-5]}><mesh position={[0,2.5,0]}><cylinderGeometry args={[.6,1,4,8]}/><meshStandardMaterial color="#765239"/></mesh><mesh position={[0,5,0]}><sphereGeometry args={[3.2,16,12]}/><meshStandardMaterial color="#367b49"/></mesh>{[-2,0,2].map(x=><mesh key={x} position={[x,4.8,2]}><sphereGeometry args={[.38,12,12]}/><meshStandardMaterial color="#f3c54e" emissive="#b97d1a" emissiveIntensity={.5}/></mesh>)}</group>}
 {chapter==="rock-avalanche"&&Array.from({length:16},(_,i)=><mesh key={i} position={[-10+(i%4)*6,.7,-12+Math.floor(i/4)*6]} rotation={[.2*i,.4*i,.1]}><dodecahedronGeometry args={[1.1+(i%3)*.3,0]}/><meshStandardMaterial color={["#787c84","#8e9297","#626b78"][i%3]}/></mesh>)}
 {GENERIC_COLLECTIBLES.map((p,i)=>!collected.includes(i)&&<Orb key={i} position={p} index={i} onCollect={collect}/>)}
 <Portal open={collected.length===3} position={[0,0,-9]}/><Text position={[0,5,-10]} fontSize={.6} anchorX="center" color="#e8efff">{label.toUpperCase()}</Text>
 <group ref={player} position={[0,0,8]}><AvatarBillboard image={selected.image} position={[0,1.25,0]} scale={1.1}/></group><group ref={a}><AvatarBillboard image={companions[0].image} position={[0,1.1,0]} scale={.9}/></group><group ref={b}><AvatarBillboard image={companions[1].image} position={[0,1.1,0]} scale={.9}/></group><Sparkles count={35} scale={[20,8,22]} color="#c2e5ff" size={2}/>
 </>;
}
export default function ThreeKidsPortalsWorld(){
 const keys=useRef(new Set<string>());const pad=useRef<[number,number]>([0,0]);
 const [avatarId,setAvatarId]=useState<string>(AVATARS[0]?.id??"vida-kids-01-rosa-morado");const [stage,setStage]=useState<ChapterStage>("portal");const [collected,setCollected]=useState<number[]>([]);const [nearPortal,setNearPortal]=useState(false);const [nearCreature,setNearCreature]=useState(false);const [rescued,setRescued]=useState(false);const [message,setMessage]=useState("Los tres amigos llegaron al claro. ¡Exploren y reúnan las tres luces!");const [chaptersOpen,setChaptersOpen]=useState(false);
 const selected=AVATARS.find(a=>a.id===avatarId)??AVATARS[0];const companions=AVATARS.filter(a=>a.id!==selected.id).slice(0,2);const profile=getPlayerProfile();const completed=profile.completedChapterIds;const unlocked=STAGES.map((id,i)=>i===0||completed.includes(STAGES[i-1]));const index=STAGES.indexOf(stage);const progress=stage==="ship"&&rescued?3:collected.length;const chapter=CHAPTERS[index];
 useEffect(()=>{try{const saved=localStorage.getItem("av-portales-avatar");if(saved&&AVATARS.some(a=>a.id===saved))setAvatarId(saved);const savedProgress=localStorage.getItem("av-portales-chapter1");if(savedProgress==="ship-rescued"){setStage("armies");setRescued(true);}}catch{}const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();keys.current.add(k);if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();if(k==="e")interact();};const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase());window.addEventListener("keydown",down);window.addEventListener("keyup",up);return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);};},[stage,nearPortal,nearCreature,collected,rescued]);
 const collect=(i:number)=>setCollected(old=>{if(old.includes(i))return old;const next=[...old,i];setMessage(stage==="portal"?"¡Luz de esperanza recogida!":"¡Objeto encontrado! El equipo avanza.");return next;});
 const pray=()=>setMessage("Los tres amigos hacen una pausa, dan gracias a Dios y piden sabiduría para cuidar y ayudar a los demás.");
 function interact(){
 if(stage==="portal"&&nearPortal){if(collected.length<3){setMessage("El portal necesita las tres luces.");return;}completeChapter("portal");setStage("ship");setCollected([]);setNearPortal(false);setMessage("¡Llegaron a la nave! Encuentra tres cristales para liberar a la criatura amigable.");return;}
 if(stage==="ship"&&nearCreature){if(collected.length<3){setMessage("La cápsula necesita tres cristales de energía.");return;}setRescued(true);completeChapter("ship");try{localStorage.setItem("av-portales-chapter1","ship-rescued");}catch{}setStage("armies");setCollected([]);setNearCreature(false);setMessage("¡Rescate completado! El capítulo 3 está desbloqueado.");return;}
 if(stage!=="portal"&&stage!=="ship"&&nearPortal){if(collected.length<3){setMessage("Faltan objetos. Exploren el escenario juntos.");return;}completeChapter(stage);const next=STAGES[index+1];if(next){setStage(next);setCollected([]);setNearPortal(false);setProfileVersion(v=>v+1);setMessage("¡Capítulo completado! El siguiente se desbloqueó.");}else setMessage("¡Completaron los siete capítulos!");return;}
 setMessage(stage==="portal"?"Busca las tres luces doradas.":stage==="ship"?"Busca los cristales de energía.":"Busca los tres objetos y luego activa el portal de salida.");
 }
 const stageLabel=stage==="portal"?"El portal misterioso":stage==="ship"?"La nave de los monstruos":chapter.title;
 return <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#071526] shadow-2xl">
 <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#0b1c31] p-4 text-white"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-200">Aventura de la Fe · 7 capítulos</p><h2 className="text-xl font-black sm:text-2xl">Los 3 niños y los portales poderosos</h2></div><button onClick={()=>setChaptersOpen(v=>!v)} className="rounded-xl border border-white/15 px-3 py-2 text-sm font-bold">Capítulos · {completed.length}/7</button></header>
 {chaptersOpen&&<div className="grid gap-2 border-b border-white/10 bg-[#091a2b] p-3 sm:grid-cols-2 lg:grid-cols-3">{CHAPTERS.map((ch,i)=><button key={ch.id} disabled={!unlocked[i]} onClick={()=>{setStage(ch.id);setCollected([]);setRescued(false);setNearPortal(false);setNearCreature(false);setMessage(ch.title+": ¡Explora y reúne los tres objetos!");setChaptersOpen(false);}} className={`rounded-xl border p-3 text-left ${unlocked[i]?"border-teal-300/40 bg-teal-300/10 hover:bg-teal-300/20":"border-white/10 bg-white/[.03] opacity-55"}`}><p className="text-lg">{ch.icon} <span className="text-xs font-black">{i+1}. {ch.title}</span></p><p className="mt-1 text-xs text-white/60">{ch.detail}</p><p className="mt-2 text-[10px] font-bold uppercase">{completed.includes(ch.id)?"Completado":unlocked[i]?"Disponible":"Bloqueado"}</p></button>)}</div>}
 <div className="relative h-[min(68vh,640px)] min-h-[440px]"><Canvas shadows camera={{position:[0,5.6,17],fov:48}} dpr={[1,1.5]}><Suspense fallback={null}>{stage==="portal"||stage==="ship"?<Environment stage={stage} selected={selected} companions={companions} keys={keys} pad={pad} collected={collected} collect={collect} setNearPortal={setNearPortal} nearPortal={nearPortal} onRescue={()=>{}} rescued={rescued} setNearCreature={setNearCreature} nearCreature={nearCreature}/>:<GenericChapterScene chapter={stage} selected={selected} companions={companions} keys={keys} pad={pad} collected={collected} collect={collect} nearGoal={nearPortal} setNearGoal={setNearPortal}/>}</Suspense></Canvas>
 <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-2xl border border-white/10 bg-slate-950/75 p-3 text-white backdrop-blur"><p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Capítulo {index+1} · {stageLabel}</p><p className="mt-1 text-sm font-bold">{stage==="portal"?"Reúne las tres luces":stage==="ship"?(rescued?"Rescate completado":"Rescata a la criatura amistosa"):"Reúne tres objetos"}</p><div className="mt-2 h-1.5 w-36 overflow-hidden rounded-full bg-white/20"><div className="h-full bg-amber-300 transition-all" style={{width:`${Math.min(100,progress/3*100)}%`}}/></div><p className="mt-1 text-xs text-white/65">{progress}/3</p></div>
 <div className="absolute right-3 top-3 rounded-xl bg-slate-950/70 p-2 text-xs text-white/80"><b>WASD</b> / flechas · <b>E</b> interactuar</div>
 <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2"><div className="max-w-[70%] rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-xs leading-5 text-white/90">{message}</div><div className="grid grid-cols-3 gap-1 sm:hidden"><span/><HoldButton label="↑" x={0} z={-1} pad={pad}/><span/><HoldButton label="←" x={-1} z={0} pad={pad}/><HoldButton label="↓" x={0} z={1} pad={pad}/><HoldButton label="→" x={1} z={0} pad={pad}/></div></div>
 {(stage==="portal"&&nearPortal||stage==="ship"&&nearCreature||stage!=="portal"&&stage!=="ship"&&nearPortal)&&<button onClick={interact} className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-5 py-3 text-sm font-black text-slate-950 shadow-lg">{stage==="portal"?collected.length===3?"Entrar al portal · E":"Portal · faltan luces":stage==="ship"?rescued?"Rescate completado":collected.length===3?"Liberar criatura · E":"Cápsula · faltan cristales":collected.length===3?"Completar capítulo · E":"Salida · faltan objetos"}</button>}
 </div>
 <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#081a2b] p-3 text-xs text-white/65"><label className="flex items-center gap-2"><span className="font-bold">Avatar:</span><select value={avatarId} onChange={e=>{setAvatarId(e.target.value);selectAvatar(e.target.value as ExistingAvatarId)}} className="rounded-lg border border-white/15 bg-slate-900 px-2 py-2 text-white">{AVATARS.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}</select></label><button onClick={pray} className="rounded-xl border border-amber-200/30 bg-amber-200/10 px-3 py-2 font-bold text-amber-100">🙏 Orar juntos</button><span>Los tres protagonistas son los avatares oficiales existentes.</span></footer>
 </div>;
}
