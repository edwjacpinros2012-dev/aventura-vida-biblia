"use client";
import { useState } from "react";
import type { DialogueLine } from "@/lib/portales/dialogue";
export default function DialogueBox({lines,onClose}:{lines:DialogueLine[];onClose?:()=>void}){
 const [index,setIndex]=useState(0); const line=lines[index]; if(!line)return null;
 const finished=index>=lines.length-1;
 return <div role="dialog" aria-modal="false" className="rounded-2xl border border-white/15 bg-slate-950/90 p-4 text-white shadow-2xl backdrop-blur">
  <p className="text-xs font-black uppercase tracking-widest text-cyan-200">{line.speaker}</p><p className="mt-2 leading-6">{line.text}</p>
  <button onClick={()=>finished?onClose?.():setIndex(i=>Math.min(lines.length-1,i+1))} className="mt-3 rounded-xl bg-amber-300 px-4 py-2 text-sm font-extrabold text-slate-950">{finished?"Cerrar":"Continuar"}</button>
 </div>;
}
