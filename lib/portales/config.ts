export const GAME_CONFIG = {
  movementSpeed: 4.6,
  companionFollowSpeed: 2.2,
  companionSpacing: 1.7,
  worldBounds: { minX: -12, maxX: 12, minZ: -14, maxZ: 14 },
  interactDistance: 3.3,
  collectibleTarget: 3,
  touchDeadZone: 0.08,
  camera: { height: 5.6, distance: 8.5, fov: 48, smoothing: 0.16 },
  graphics: { maxPixelRatio: 1.5, fogNear: 18, fogFar: 38 },
} as const;
export type GameConfig = typeof GAME_CONFIG;
