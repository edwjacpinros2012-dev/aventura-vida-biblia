"use client";
import type { ReactNode } from "react";
export type MissionHudProps = { chapterLabel: string; objectiveLabel: string; count: number; target: number; children?: ReactNode };
export default function MissionHud({chapterLabel,objectiveLabel,count,target,children}:MissionHudProps){
 const ratio=target>0?Math.max(0,Math.min(1,count/target)):0;
 return <section aria-live="polite" className="pointer-events-none rounded-2xl border border-white/10 bg-slate-950/75 p-3 text-white shadow-lg backdrop-blur">
  <p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-200">{chapterLabel}</p>
  <h2 className="mt-1 text-sm font-extrabold">{objectiveLabel}</h2>
  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-amber-300 transition-all duration-300" style={{width:`${ratio*100}%`}}/></div>
  <p className="mt-1 text-xs text-white/65">{count} / {target}</p>{children}
 </section>;
}
