"use client";
import type { MutableRefObject } from "react";
export type TouchDirectionRef=MutableRefObject<[number,number]>;
export default function TouchControls({directionRef}:{directionRef:TouchDirectionRef}){
 const press=(x:number,z:number)=>{directionRef.current=[x,z]};
 const release=()=>{directionRef.current=[0,0]};
 const control=(label:string,x:number,z:number)=><button key={label} aria-label={label} onPointerDown={e=>{e.preventDefault();press(x,z)}} onPointerUp={release} onPointerLeave={release} onPointerCancel={release} className="touch-none select-none rounded-xl border border-white/20 bg-slate-900/80 px-4 py-3 font-black text-white active:bg-cyan-300 active:text-slate-900">{label}</button>;
 return <div className="grid grid-cols-3 gap-1 sm:hidden" aria-label="Controles táctiles"><span/>{control("Arriba",0,-1)}<span/>{control("Izquierda",-1,0)}{control("Abajo",0,1)}{control("Derecha",1,0)}</div>;
}
