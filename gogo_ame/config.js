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
    // Level 1-4 (Original)
    "rgba(52, 152, 219, 0.7)", // L1: Blue
    "rgba(142, 68, 173, 0.7)", // L2: Purple
    "rgba(230, 126, 34, 0.7)", // L3: Orange
    "rgba(241, 196, 15, 0.7)", // L4: Yellow/Gold
    // Level 5-20 (New)
    "rgba(168, 204, 52, 0.7)", // L5: Lime
    "rgba(46, 204, 113, 0.7)", // L6: Green
    "rgba(22, 160, 133, 0.7)", // L7: Teal
    "rgba(26, 188, 156, 0.7)", // L8: Cyan
    "rgba(52, 172, 224, 0.7)", // L9: Sky Blue
    "rgba(41, 128, 185, 0.7)", // L10: Royal Blue
    "rgba(88, 86, 214, 0.7)", // L11: Indigo
    "rgba(155, 89, 182, 0.7)", // L12: Violet
    "rgba(191, 54, 124, 0.7)", // L13: Magenta
    "rgba(231, 84, 128, 0.7)", // L14: Hot Pink
    "rgba(231, 76, 60, 0.7)", // L15: Red
    "rgba(217, 30, 24, 0.7)", // L16: Crimson
    "rgba(0, 150, 100, 0.7)", // L17: Emerald
    "rgba(10, 80, 200, 0.7)", // L18: Sapphire
    "rgba(189, 195, 199, 0.7)", // L19: Silver
    "rgba(255, 255, 255, 0.8)", // L20: White Diamond
  ],
  levelColorsBlack: [
    // Level 1-4 (Original)
    "rgba(60, 65, 70, 0.85)", // L1: Dark Gray/Black
    "rgba(88, 42, 107, 0.85)", // L2: Dark Purple
    "rgba(140, 78, 21, 0.85)", // L3: Dark Orange/Brown
    "rgba(145, 117, 9, 0.85)", // L4: Dark Gold/Brown
    // Level 5-20 (New)
    "rgba(101, 122, 31, 0.85)", // L5: Dark Lime
    "rgba(28, 122, 68, 0.85)", // L6: Dark Green
    "rgba(13, 96, 79, 0.85)", // L7: Dark Teal
    "rgba(15, 112, 93, 0.85)", // L8: Dark Cyan
    "rgba(31, 103, 134, 0.85)", // L9: Dark Sky Blue
    "rgba(24, 77, 111, 0.85)", // L10: Dark Royal Blue
    "rgba(53, 61, 150, 0.85)", // L11: Dark Indigo
    "rgba(93, 53, 109, 0.85)", // L12: Dark Violet
    "rgba(114, 32, 74, 0.85)", // L13: Dark Magenta
    "rgba(138, 50, 77, 0.85)", // L14: Dark Hot Pink
    "rgba(138, 45, 36, 0.85)", // L15: Dark Red
    "rgba(130, 18, 14, 0.85)", // L16: Dark Crimson
    "rgba(0, 90, 60, 0.85)", // L17: Dark Emerald
    "rgba(6, 48, 120, 0.85)", // L18: Dark Sapphire
    "rgba(93, 98, 100, 0.85)", // L19: Slate
    "rgba(20, 20, 20, 0.9)", // L20: Onyx
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
  windCurveLifetime: 1000, // How long the curve lasts in ms
  windInfluenceRadius: 40, // How close a ball must be to the curve to be affected
  windStrength: 0.08, // How much acceleration the wind applies per frame
  minPointDistance: 15, // Minimum distance between points on the curve to be recorded
  windCurveColor: "rgba(255, 255, 255, 0.7)", // Visual color of the wind
  windMaxWidth: 12, // The width of the stroke at its start in pixels
  windMinWidth: 3, // The width of the stroke at its end
  windCouplingStrength: 0.003,
  windFillColor: "rgba(220, 235, 255, 0.7)", // The fill color of the stroke
  voidSymbolColor: "rgba(192, 57, 43, 0.85)",
  MAX_SYMBOL_LEVEL: 10,
  sidewaysWindStrength: 0.001, // How strong the gusts are
  windOscillationAmplitude: 0.01, // How strong the gusts are
  windOscillationFrequency1: 0.5, // Speed of the main gusting effect
  windOscillationFrequency2: 1.2, // Speed of a smaller, secondary ripple for more randomness
  windMaxSpeed: 2.5, // The target speed for balls caught in the wind
};
