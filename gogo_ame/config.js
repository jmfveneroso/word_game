export const Config = {
  Initial_Lives: 100,
  Initial_Ratio_Black_To_Gray: 0.2,
  Construction_Particle_Count: 25,
  Construction_Particle_Speed: 4,
  Explosion_Particle_Count: 50,
  Explosion_Particle_Speed: 7,
  Debris_Particle_Count: 15,
  Debris_Particle_Speed: 3,
  levelColorsGray: [
    "rgba(52, 152, 219, 0.7)", // L1: Blue
    "rgba(142, 68, 173, 0.7)", // L2: Purple
    "rgba(230, 126, 34, 0.7)", // L3: Orange
    "rgba(241, 196, 15, 0.7)", // L4: Yellow/Gold
  ],
  levelColorsBlack: [
    "rgba(60, 65, 70, 0.85)", // L1: Dark Gray/Black
    "rgba(88, 42, 107, 0.85)", // L2: Dark Purple
    "rgba(140, 78, 21, 0.85)", // L3: Dark Orange/Brown
    "rgba(145, 117, 9, 0.85)", // L4: Dark Gold/Brown
  ],
  symbolColor: "#FFFFFF",
  grabbedBallSymbolColor: "#f1c40f",
  particleConstructColor: { r: 200, g: 220, b: 255 },
  particleExplosionColor: { r: 255, g: 180, b: 120 },
  particleDebrisColor: { r: 180, g: 180, b: 180 },
  horizontalFriction: 0.99,
  bounceEfficiency: -0.5,
  PARTICLE_LIFETIME_MS: 1000,
  PARTICLE_FRICTION: 0.96,
  gravity: 0.05,
  terminalVelocity: 0.3,
  friction: 0.985,
  throwMultiplier: 0.1,
  baseBallRadius: 20,
  ballCreationInterval: 200,
  slingshotMaxStrength: 150,
  slingshotArrowColor: "rgba(255, 255, 0, 0.7)",
  slingshotPowerMultiplier: 0.05,
};
