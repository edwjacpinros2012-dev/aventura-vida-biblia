type AudioCue = "portal" | "collect" | "success" | "soft";
const SOUND_PATHS: Record<AudioCue,string>={portal:"/audio/portales/portal.mp3",collect:"/audio/portales/collect.mp3",success:"/audio/portales/success.mp3",soft:"/audio/portales/soft.mp3"};
let enabled=true; let volume=0.55;
export function setGameAudioEnabled(value:boolean){enabled=value;}
export function setGameAudioVolume(value:number){volume=Math.max(0,Math.min(1,value));}
export function playGameCue(cue:AudioCue){if(!enabled||typeof window==="undefined")return;try{const audio=new Audio(SOUND_PATHS[cue]);audio.volume=volume;void audio.play().catch(()=>{});}catch{}}
export function audioCuePath(cue:AudioCue){return SOUND_PATHS[cue];}
