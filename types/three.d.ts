// Temporary, minimal TypeScript declarations for the Three.js symbols used by this prototype.
// The official @types/three package should replace this shim when the lockfile can be regenerated.
declare module "three" {
  export const SRGBColorSpace: any;
  export class Vector2 {
    constructor(x?: number, y?: number);
    x: number; y: number;
    lengthSq(): number;
    normalize(): this;
  }
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number; y: number; z: number;
    lerp(v: Vector3, alpha: number): this;
  }
  export class Mesh {
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
    lookAt(x: number, y: number, z: number): void;
  }
  export const MathUtils: { clamp(value: number, min: number, max: number): number };
}

// React Three Fiber JSX elements used in the project; official R3F types can replace this shim.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}
