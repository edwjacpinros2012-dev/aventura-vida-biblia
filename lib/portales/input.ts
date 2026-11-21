export const GAME_KEYS = { forward:["w","arrowup"], backward:["s","arrowdown"], left:["a","arrowleft"], right:["d","arrowright"], interact:["e"], jump:[" "] } as const;
export type Direction = { x: number; z: number };
export function keyboardDirection(keys: ReadonlySet<string>): Direction { return { x:Number(GAME_KEYS.right.some(k=>keys.has(k)))-Number(GAME_KEYS.left.some(k=>keys.has(k))), z:Number(GAME_KEYS.backward.some(k=>keys.has(k)))-Number(GAME_KEYS.forward.some(k=>keys.has(k))) }; }
export function normalizeDirection(direction: Direction): Direction { const length=Math.hypot(direction.x,direction.z); return length>1?{x:direction.x/length,z:direction.z/length}:direction; }
export function isInteractPressed(keys: ReadonlySet<string>){return GAME_KEYS.interact.some(k=>keys.has(k));}
