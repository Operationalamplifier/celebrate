export interface Coordinate {
  x: number;
  y: number;
}

export interface FireworkOptions {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  hue: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  hue: number;
  decay: number;
}

export enum SoundType {
  LAUNCH,
  EXPLOSION
}