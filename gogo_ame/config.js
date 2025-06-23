export const Config = {
  throwMultiplier: 0.1,
  baseBallRadius: 14,
  terminalVelocity: 0.3,
  friction: 0.985,
  windBaseLifetime: 200, // How long the curve lasts in ms
  windLifetimePerPixel: 4,
  windInfluenceRadius: 40, // How close a ball must be to the curve to be affected
  windStrength: 0.1, // How much acceleration the wind applies per frame
  windMaxSpeed: 2.5, // The target speed for balls caught in the wind
  windOscillationAmplitude: 0.003, // How strong the gusts are
  windOscillationFrequency1: 0.1, // Speed of the main gusting effect
  windOscillationFrequency2: 0.0, // Speed of a smaller, secondary ripple for more randomness
  MAX_SYMBOL_LEVEL: 10,
  minPointDistance: 10, // Minimum distance between points on the curve to be recorded
  windMaxWidth: 12, // The width of the stroke at its start in pixels
  windMinWidth: 2, // The width of the stroke at its end
  horizontalFriction: 0.99,
  bounceEfficiency: -0.5,
  windForceFalloff: 0.75,
  windCouplingStrength: 0.008,
  ballCreationInterval: 800,
  enableBallTrails: true,
  enableBallTrailsForVoid: true,
  voidSymbolSpawnRate: 0.15,
  blackVoidSymbolSpawnRate: 0.0,
  sidewaysWindStrength: 0.001, // How strong the gusts are
  voidBallRadiusMultiplier: 1.0,
  voidSizeMultiplierMin: 1.0, // The smallest a void symbol can be (e.g., 0.5 = 50% of base radius).
  voidSizeMultiplierMax: 1.0,
  voidSpeedMultiplier: 1.5,
  enableExplosions: false,
  enableWildcard: false,
  enableDegradation: false,
  enableHardDegradation: false,
  enableWildcardColor: false,
  degradationKnockback: 2,
  degradationWindImmunityDuration: 1000,
  enableVariableVoidSize: true, // Master switch to turn this feature on/off.
  drawWindCurve: false,
  enableDangerHighlight: true,
  dangerHighlightMinLevel: 2, // Only highlight potential collisions for balls of this level or higher
  dangerHighlightBlur: 25, // The blur radius of the glow
  dangerHighlightMaxDistance: 100,
  enableLivesSystem: true,
  minLevelToLoseLife: 2,
  initialLives: 3,
  lifeLossAnimationDuration: 400, // How long the effect lasts in ms
  screenShakeMagnitude: 10, // How intense the screen shake is in pixels
  highestScoreAnimationDuration: 1000, // Duration in ms
  highestScoreFlashColor: "#FFD700", // A gold color for the flash
  enableSimpleCombinationMode: false,
  sizeIncreasePerLevel: 0.04,
  enableWindCombination: false,
  enableWindSparkles: false,
  windCombinationChargeTime: 1500,
  enableBallBorder: false,
  enableBallFill: true,
  windArrivalDistance: 90, // Distance (in pixels) from the curve to start slowing down
  invertColors: false,
  strokeColors: false,
  gravityMassEffect: 1.0,
  // Stable parameters.
  ballTrailLength: 120, // How many points to store in the trail.
  ballTrailStartWidth: 1, // The width of the trail at its oldest point (in pixels).
  ballTrailEndWidth: 3, // The width of the trail right behind the symbol.
  ballTrailOpacity: 0.003,
  highestLevelAnimationDuration: 3000,
  constructionAnimationDuration: 400,
  windParticlesPerFrame: 1, // How many particles to spawn each frame along the curve
  windParticleSpread: 30,
  windParticleLifetime: 2000, // How long each particle lasts in ms
  windParticleSpawnRate: 3, // How many particles to spawn per recorded mouse point
  windParticleBaseSpeed: 1.5, // The base speed for particles flowing along the curve
  windParticleSpeedVariance: 1.0, // Randomness added to the speed
  windParticleTrailLength: 39,
  windShadowBlur: 15,
  slingshotMaxStrength: 150,
  slingshotPowerMultiplier: 0.05,
  PARTICLE_LIFETIME_MS: 1000,
  PARTICLE_FRICTION: 0.96,
  Construction_Particle_Count: 25,
  Construction_Particle_Speed: 4,
  Explosion_Particle_Count: 50,
  Explosion_Particle_Speed: 7,
  Debris_Particle_Count: 15,
  Debris_Particle_Speed: 3,
  gravity: 0.05,
  highestLevelParticleCount: 200,
  highestLevelParticleSpeed: 10,
  highestLevelParticleLifetime: 2500, // Make them last longer
  lifeSymbolFallSpeedMultiplier: 1.5, // Makes it fall 50% faster than normal
  lifeSymbolSpawnRate: 0.001,
  maxLives: 5, // The maximum number of lives the player can have
  scorePopupLifetime: 1200,      // How long the text stays on screen (in ms)
  scorePopupFontSize: 22,        // The starting font size in pixels
  scorePopupUpwardSpeed: -0.8,   // The initial upward velocity

  // Canvas background is a special case, handled in script.js, but we'll define it here.
  backgroundColor: { normal: '#444', inverted: '#dde1e6' },

  // Symbol Colors
  symbolColor:          { normal: "#FFFFFF", inverted: "#000000" },
  grabbedBallSymbolColor: { normal: "#f1c40f", inverted: "#2980b9" }, // Gold -> Strong Blue
  voidSymbolColor:        { normal: "rgba(192, 57, 43, 0.9)", inverted: "rgba(231, 76, 60, 0.9)" }, // Keep red, but maybe brighter
  lifeSymbolColor:        { normal: "rgba(46, 204, 113, 0.9)", inverted: "rgba(39, 174, 96, 1.0)" },   // Keep green
  lifeLeafColor:        { normal: "rgba(46, 204, 113, 0.5)", inverted: "rgba(46, 204, 113, 0.5)" },   // Keep green
  lostLifeLeafColor:    { normal: "rgba(50, 50, 50, 0.7)", inverted: "rgba(189, 195, 199, 0.8)" }, // Dark Gray -> Light Gray

  // Particle & Effect Colors
  windFillColor:          { normal: "rgba(220, 235, 255, 0.7)", inverted: "rgba(50, 50, 80, 0.6)"},
  dangerHighlightColor:   { normal: "rgba(255, 50, 50, 0.7)", inverted: "rgba(255, 50, 50, 0.7)"},
  particleConstructColor: { normal: { r: 200, g: 220, b: 255 }, inverted: { r: 44, g: 62, b: 80 } },
  particleExplosionColor: { normal: { r: 255, g: 180, b: 120 }, inverted: { r: 100, g: 30, b: 22 } },
  // particleExplosionColor: { r: 255, g: 180, b: 120 },
  particleDebrisColor:    { normal: { r: 180, g: 180, b: 180 }, inverted: { r: 80, g: 80, b: 80 } },
  windParticleColor:      { normal: { r: 220, g: 235, b: 255 }, inverted: { r: 44, g: 62, b: 80 } },
  highestLevelParticleColor: { normal: { r: 255, g: 215, b: 0 }, inverted: { r: 60, g: 20, b: 80 } }, // Gold -> Dark Purple
  scorePopupColor: { normal: "rgba(255, 223, 0, 1)", inverted: "rgba(0, 0, 0, 1)" }, 

  lifeLossFlashColor: "rgba(200, 0, 0, 0.6)", // Color of the screen flash

  levelColorsGray: [
    "rgba(52, 152, 219, 0.7)",  // L1: Blue
    "rgba(142, 68, 173, 0.7)",  // L2: Purple
    "rgba(230, 126, 34, 0.7)",  // L3: Orange
    "rgba(241, 196, 15, 0.7)",  // L4: Yellow/Gold
    "rgba(168, 204, 52, 0.7)",  // L5: Lime
    "rgba(10, 80, 200, 0.7)",   // L6: Sapphire
    "rgba(191, 54, 124, 0.7)",  // L7: Magenta
    "rgba(26, 188, 156, 0.7)",  // L8: Cyan
    "rgba(0, 150, 100, 0.7)",   // L9: Emerald
    "rgba(189, 195, 199, 0.7)", // L10: Silver
    "rgba(88, 86, 214, 0.7)",   // L11: Indigo
    "rgba(155, 89, 182, 0.7)",  // L12: Violet
    "rgba(26, 188, 156, 0.7)",  // L13: Cyan
    "rgba(231, 84, 128, 0.7)",  // L14: Hot Pink
    "rgba(231, 76, 60, 0.7)",   // L15: Red
    "rgba(217, 30, 24, 0.7)",   // L16: Crimson
    "rgba(52, 172, 224, 0.7)",  // L17: Sky Blue
    "rgba(46, 204, 113, 0.7)",  // L8: Green
    "rgba(22, 160, 133, 0.7)",  // L8: Teal
    "rgba(41, 128, 185, 0.7)",  // L19: Royal Blue
    "rgba(255, 255, 255, 0.8)", // L20: White Diamond
  ],
};
