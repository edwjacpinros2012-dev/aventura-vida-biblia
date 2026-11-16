"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CharacterAvatar } from "@/components/character-avatar";
import { VictoryPanel, useGameCompletion } from "@/components/games/game-shell";
import { avatarFallbackFor } from "@/lib/characters/catalog";
import { usePlayerProgress } from "@/components/player-progress-provider";

const heroes = [
  ["Rosa y morado","vida-kids-01-rosa-morado"],["Camiseta blanca","vida-kids-02-blanco"],
  ["Sudadera azul","vida-kids-03-azul"],["Camiseta beige","vida-kids-04-beige"],
  ["Camiseta verde","vida-kids-05-verde"],["Camiseta roja","vida-kids-06-rojo"],
] as const;
const vowels = [
  {letter:"A",word:"Árbol",emoji:"🌳",color:"#ef4444"},
  {letter:"E",word:"Estrella",emoji:"⭐",color:"#a855f7"},
  {letter:"I",word:"Iglú",emoji:"🏔️",color:"#0d9488"},
  {letter:"O",word:"Oveja",emoji:"🐑",color:"#f97316"},
  {letter:"U",word:"Uva",emoji:"🍇",color:"#0284c7"},
];
const button = "rounded-2xl border-b-[5px] px-4 py-3 font-black shadow-lg transition active:translate-y-1 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50";

export function LittleBigHeroesGame() {
  const {identity}=usePlayerProgress();
  const {result,finish,resetCompletion}=useGameCompletion("little-big-heroes");
  const [screen,setScreen]=useState<"menu"|"run"|"station"|"store"|"over">("menu");
  const [heroIndex,setHeroIndex]=useState(()=>Math.max(0,heroes.findIndex(h=>h[1]===identity.avatarKey)));
  const [lives,setLives]=useState(6),[sheep,setSheep]=useState(0),[stars,setStars]=useState(0),[distance,setDistance]=useState(0);
  const [jumping,setJumping]=useState(false),[sound,setSound]=useState(true),[targetIndex,setTargetIndex]=useState(0);
  const [stationDone,setStationDone]=useState(false),[notice,setNotice]=useState("¡Rescata ovejitas y aprende las vocales!");
  const [hazard,setHazard]=useState(false);
  const tick=useRef(0),jumpTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const hero=heroes[heroIndex],target=vowels[targetIndex%5],points=sheep*25+stars*10+Math.floor(distance/10);
  const speak=useCallback((text:string)=>{if(!sound||typeof window==="undefined"||!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="es-ES";u.rate=.86;u.pitch=1.12;window.speechSynthesis.speak(u)},[sound]);
  const reset=useCallback(()=>{tick.current=0;setLives(6);setSheep(0);setStars(0);setDistance(0);setJumping(false);setHazard(false);setTargetIndex(0);setStationDone(false);setNotice("¡Corre, salta y rescata!");resetCompletion();setScreen("run")},[resetCompletion]);
  const jump=useCallback(()=>{if(screen!=="run"||jumping)return;setJumping(true);if(jumpTimer.current)clearTimeout(jumpTimer.current);jumpTimer.current=setTimeout(()=>setJumping(false),760)},[screen,jumping,lives]);
  useEffect(()=>{if(screen!=="run")return;const timer=window.setInterval(()=>{tick.current++;setDistance(v=>v+2);
    if(tick.current%17===0){setHazard(true);if(!jumping){if(lives<=1)setScreen("over");setLives(v=>Math.max(0,v-1));setNotice("¡Cuidado con la roca! ¡Salta!")}else{setStars(v=>v+1);setNotice("¡Salto perfecto! +1 estrella")}}
    if(tick.current%17===5)setHazard(false);
    if(tick.current%13===0){setSheep(v=>v+1);setNotice("¡Ovejita rescatada! +25 puntos")}
    if(tick.current%65===0){setTargetIndex(Math.floor(tick.current/65)-1);setStationDone(false);setScreen("station");setNotice("¡Parada educativa!");}
    if(tick.current%29===0)setStars(v=>v+1);
  },150);return()=>window.clearInterval(timer)},[screen,jumping]);
  useEffect(()=>{if(screen!=="run")return;const key=(e:KeyboardEvent)=>{if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();jump()}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[jump,screen]);
  useEffect(()=>()=>{if(jumpTimer.current)clearTimeout(jumpTimer.current);if("speechSynthesis"in window)window.speechSynthesis.cancel()},[]);
  const answer=(letter:string)=>{if(letter===target.letter){setStationDone(true);setStars(v=>v+5);setNotice("¡Muy bien! "+target.letter+" de "+target.word);speak("¡Excelente! "+target.letter+" de "+target.word)}else{speak("Busca la vocal "+target.letter);setNotice("¡Inténtalo otra vez! Busca la "+target.letter)}};
  const finishRun=()=>finish({points:Math.max(50,points),xp:Math.max(20,Math.floor(points/5))});
  if(result)return <VictoryPanel title="¡Héroe de las vocales!" description="Has recorrido el valle, rescatado ovejitas y completado tu aventura educativa." result={result} points={Math.max(50,points)} xp={Math.max(20,Math.floor(points/5))} onPlayAgain={reset} actionLabel="¡Otra aventura!" />;
  return <div className="mt-6 overflow-hidden rounded-[2rem] border-[5px] border-[#8b4a18] bg-[#fff3d6] shadow-[0_18px_50px_rgba(0,0,0,.28)]">
    <style jsx>{`@keyframes drift{to{transform:translateX(22px)}}@keyframes bob{50%{transform:translateY(-9px) rotate(2deg)}}@keyframes jump{45%{transform:translateY(-58px)}}.cloud{animation:drift 5s ease-in-out infinite alternate}.bob{animation:bob 2.4s ease-in-out infinite}.runner{animation:jump .76s ease-out}`}</style>
    {screen==="menu"&&<div className="relative overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-300 p-4 sm:p-8">
      <div className="pointer-events-none absolute inset-0"><span className="cloud absolute left-[8%] top-8 text-6xl">☁️</span><span className="cloud absolute right-[12%] top-16 text-7xl">☁️</span><div className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-green-600 to-green-400"/></div>
      <div className="relative mx-auto max-w-4xl rounded-[2rem] border-[7px] border-amber-800 bg-[#fff5df] p-5 text-center shadow-[0_12px_0_#713f12,0_24px_40px_rgba(0,0,0,.2)] sm:p-8">
        <div className="bob mx-auto grid h-20 w-20 place-items-center rounded-[1.7rem] border-4 border-white bg-gradient-to-br from-orange-400 to-amber-600 text-5xl shadow-xl">🚂</div>
        <p className="mt-3 inline-flex rounded-full border-2 border-amber-700 bg-amber-200 px-4 py-1 text-xs font-black tracking-[.2em] text-amber-950">AVENTURA EDUCATIVA</p>
        <h2 className="mt-3 font-display text-4xl font-black leading-none text-amber-950 sm:text-6xl">LITTLE BIG HEROES</h2>
        <div className="mx-auto mt-3 w-fit -rotate-1 rounded-2xl border-4 border-amber-900 bg-gradient-to-r from-orange-500 to-red-500 px-6 py-2 text-2xl font-black text-white shadow-lg sm:text-4xl">RUN HERO RUN!</div>
        <p className="mt-4 font-bold text-amber-900">¡Corre por el valle, rescata ovejitas y completa el tren de las vocales!</p>
        <div className="mt-6 rounded-3xl border-4 border-purple-700 bg-gradient-to-br from-violet-100 to-fuchsia-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black uppercase text-purple-950">Elige tu avatar oficial</p><span className="rounded-full bg-purple-700 px-3 py-1 text-xs font-black text-white">PROYECTO VIDA KIDS</span></div>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">{heroes.map(([name,key],i)=><button key={key} onClick={()=>setHeroIndex(i)} aria-pressed={heroIndex===i} className={`rounded-2xl border-4 p-2 transition ${heroIndex===i?"scale-105 border-amber-500 bg-white shadow-xl":"border-purple-200 bg-white/70"}`}><div className="mx-auto h-20 sm:h-24"><CharacterAvatar avatarKey={key} fallback={avatarFallbackFor(key)} alt={name} variant="full" imageSizes="120px" className="grid h-full w-full place-items-center rounded-xl bg-sky-100 text-4xl"/></div><span className="mt-2 block text-[10px] font-black text-slate-800 sm:text-xs">{name}</span>{heroIndex===i&&<span className="text-[10px] font-black text-emerald-700">ELEGIDO ✓</span>}</button>)}</div>
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={reset} className={`${button} border-orange-900 bg-gradient-to-b from-orange-400 to-orange-600 text-2xl text-white sm:min-w-64`}>▶ JUGAR</button><button onClick={()=>setScreen("store")} className={`${button} border-purple-900 bg-gradient-to-b from-purple-500 to-indigo-600 text-white`}>⭐ HÉROES</button></div>
        <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-black text-amber-950"><span>❤️ ❤️ ❤️ ❤️ ❤️ ❤️</span><span>🐑 Rescata ovejitas</span><span>⭐ Gana estrellas</span></div>
      </div></div>}
    {screen==="store"&&<div className="bg-gradient-to-b from-indigo-500 to-purple-800 p-6 text-center text-white"><p className="text-xs font-black tracking-[.2em] text-yellow-200">COLECCIÓN OFICIAL</p><h2 className="mt-2 text-4xl font-black">HÉROES VIDA KIDS</h2><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{heroes.map(([name,key],i)=><button key={key} onClick={()=>{setHeroIndex(i);setScreen("menu")}} className="rounded-2xl border-2 border-white/30 bg-white/10 p-3"><div className="mx-auto h-28"><CharacterAvatar avatarKey={key} fallback={avatarFallbackFor(key)} alt={name} variant="full" imageSizes="140px" className="grid h-full w-full place-items-center text-4xl"/></div><p className="mt-2 text-xs font-black">{name}</p><p className="text-[10px] font-bold text-yellow-200">SELECCIONAR</p></button>)}</div><button onClick={()=>setScreen("menu")} className={`${button} mt-6 border-slate-800 bg-slate-700`}>← VOLVER</button></div>}
    {(screen==="run"||screen==="station"||screen==="over")&&<div className="relative min-h-[520px] overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-300 sm:min-h-[570px]">
      <div className="absolute inset-0"><span className="cloud absolute left-[10%] top-24 text-6xl">☁️</span><span className="cloud absolute right-[14%] top-16 text-7xl">☁️</span><div className="absolute bottom-[26%] h-28 w-full rounded-[50%] bg-green-400/70"/><div className="absolute bottom-[19%] -left-10 h-28 w-[120%] rounded-[50%] bg-green-500/80"/><div className="absolute bottom-0 h-[22%] w-full border-t-8 border-amber-800 bg-gradient-to-b from-amber-300 to-amber-500"/><div className="absolute bottom-[8%] h-3 w-full border-y-2 border-amber-700/40 bg-amber-100/70"/></div>
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-3"><button onClick={()=>setScreen("menu")} className="rounded-xl border-2 border-amber-800 bg-amber-100 px-3 py-2 text-sm font-black text-amber-950">🏠 Menú</button><div className="flex gap-1 rounded-2xl border-2 border-white/70 bg-amber-900/30 p-1.5">{vowels.map((v,i)=><span key={v.letter} className={`grid h-9 w-9 place-items-center rounded-xl border-2 text-lg font-black ${i===targetIndex%5?"border-yellow-300 bg-orange-500 text-white":"border-white/60 bg-amber-100 text-amber-950"}`}>{v.letter}</span>)}</div><button onClick={()=>setSound(v=>!v)} className="rounded-xl border-2 border-sky-800 bg-white px-3 py-2 font-black text-sky-900">{sound?"🔊":"🔇"}</button></div>
      <div className="relative z-10 mx-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-white/80 bg-white/90 px-3 py-2 shadow-lg"><span className="text-lg">{Array.from({length:6},(_,i)=><span key={i}>{i<lives?"❤️":"🖤"}</span>)}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-900">🐑 {sheep}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-900">⭐ {stars}</span><span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-black text-sky-900">🏁 {Math.floor(distance/10)} m</span></div>
      <div className="relative z-10 mt-4 flex h-12 items-center justify-center px-3"><span className="rounded-full border-2 border-amber-400 bg-white/95 px-5 py-2 text-center text-sm font-black text-amber-950 shadow-lg">{notice}</span></div>
      <div className="absolute bottom-[20%] left-[8%] z-10 flex items-end gap-5"><div className={`h-36 w-28 sm:h-44 sm:w-36 ${jumping?"runner":"bob"}`}><CharacterAvatar avatarKey={hero[1]} fallback={avatarFallbackFor(hero[1])} alt={hero[0]} variant="full" imageSizes="160px" className="grid h-full w-full place-items-end text-5xl drop-shadow-xl"/></div><span className="bob mb-1 text-5xl">🐑</span></div>
      <div className="absolute bottom-[22%] right-[12%] z-10 text-5xl">{hazard?"🪨":"🌼"}</div><span className="absolute right-[7%] top-[35%] z-10 text-4xl">⭐</span>
      {screen==="run"&&<div className="absolute bottom-4 right-4 z-20 flex items-center gap-3"><button onClick={finishRun} className="rounded-xl border-2 border-white/80 bg-purple-600 px-4 py-2 text-xs font-black text-white shadow-lg">TERMINAR</button><button onClick={jump} className="grid h-24 w-24 place-items-center rounded-full border-[5px] border-white bg-gradient-to-b from-lime-400 to-green-600 text-lg font-black text-white shadow-[0_8px_0_#166534]">⬆️<span className="block text-xs">SALTAR</span></button></div>}
      {screen==="station"&&<div className="absolute inset-0 z-30 grid place-items-center bg-indigo-950/80 p-3 backdrop-blur-sm"><div className="w-full max-w-2xl rounded-[2rem] border-[6px] border-orange-500 bg-amber-50 p-5 text-center shadow-2xl"><span className="rounded-full bg-yellow-300 px-4 py-1 text-xs font-black text-amber-950">🚂 ESTACIÓN DEL TREN</span><h3 className="mt-3 text-2xl font-black text-amber-950">¡Encuentra la vocal {target.letter}!</h3><p className="mt-2 font-bold text-orange-800">Toca el vagón de {target.letter} de {target.word}</p><div className="my-4 text-6xl">{target.emoji}</div><button onClick={()=>speak("Busca la vocal "+target.letter+". "+target.letter+" de "+target.word)} className="rounded-full bg-sky-500 px-5 py-2 font-black text-white">🔊 ESCUCHAR</button><div className="mt-5 grid grid-cols-5 gap-2">{vowels.map(v=><button key={v.letter} onClick={()=>answer(v.letter)} className="aspect-square rounded-xl border-b-4 border-amber-900 text-3xl font-black text-white shadow-lg sm:text-5xl" style={{background:v.color}}>{v.letter}</button>)}</div>{stationDone&&<div className="mt-4"><p className="font-black text-emerald-700">¡Vocal rescatada! +5 estrellas</p><button onClick={()=>{setScreen("run");setNotice("¡Sigue la carrera!")}} className="mt-3 rounded-xl border-b-4 border-green-800 bg-green-500 px-6 py-3 font-black text-white">🚀 SEGUIR CORRIENDO</button></div>}</div></div>}
      {screen==="over"&&<div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/75 p-4"><div className="w-full max-w-md rounded-[2rem] border-[6px] border-rose-600 bg-amber-50 p-6 text-center shadow-2xl"><div className="text-5xl">🐑⭐</div><h3 className="mt-3 text-3xl font-black text-amber-950">¡Buen intento!</h3><p className="mt-2 text-sm font-bold text-slate-700">Las ovejitas te esperan para otra aventura.</p><div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-amber-100 p-3 font-black text-amber-950"><span>🐑 {sheep}</span><span>⭐ {stars}</span></div><button onClick={reset} className={`${button} mt-5 w-full border-orange-900 bg-orange-500 text-white`}>🔄 VOLVER A JUGAR</button><button onClick={()=>setScreen("menu")} className="mt-3 text-sm font-black text-amber-900 underline">Volver al menú</button></div></div>}
    </div>}
    <div className="flex flex-wrap items-center justify-between gap-2 border-t-4 border-amber-900 bg-amber-100 px-4 py-3 text-xs font-black text-amber-950"><span>🌟 LITTLE BIG HEROES</span><span>Héroe: {hero[0]}</span><span>PROYECTO VIDA KIDS</span></div>
  </div>;
}
