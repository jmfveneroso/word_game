export const baseConfig = {
  throwMultiplier: 0.1,
  baseBallRadius: 14,
  terminalVelocity: 0.5,
  terminalVelocitySymbol: 0.25,
  enableCollision: true,
  enableImmunity: true,
  immunityKnockback: 2.5, // The force of the knockback on the L1 ball
  friction: 0.97,
  windBaseLifetime: 0, // How long the curve lasts in ms
  windLifetimePerPixel: 4,
  windInfluenceRadius: 28, // How close a ball must be to the curve to be affected
  windMaxSpeed: 2.5, // The target speed for balls caught in the wind
  windBaseStrength: 0.1, // The minimum strength of any wind curve
  windStrengthPer100px: 0.03,
  windOscillationAmplitude: 0.006, // How strong the gusts are
  windOscillationFrequency1: 0.2, // Speed of the main gusting effect
  windOscillationFrequency2: 0.0, // Speed of a smaller, secondary ripple for more randomness
  MAX_SYMBOL_LEVEL: 10,
  minPointDistance: 10, // Minimum distance between points on the curve to be recorded
  windMaxWidth: 12, // The width of the stroke at its start in pixels
  windMinWidth: 2, // The width of the stroke at its end
  horizontalFriction: 0.99,
  bounceEfficiency: -0.5,
  windForceFalloff: 1.0,
  couplingCurvatureFactor: 60,
  windCouplingStrength: 0.015,
  windArrivalDistance: 100, // Distance (in pixels) from the curve to start slowing down
  couplingSpeedFactor: 0.04,
  ballCreationInterval: 800,
  enableBallTrails: true,
  enableBallTrailsForVoid: true,
  voidSymbolSpawnRate: 0.25,
  blackVoidSymbolSpawnRate: 0.0,
  sidewaysWindStrength: 0.001, // How strong the gusts are
  voidBallRadiusMultiplier: 1.0,
  voidSizeMultiplierMin: 1.1, // The smallest a void symbol can be (e.g., 0.5 = 50% of base radius).
  voidSizeMultiplierMax: 1.1,
  voidSpeedMultiplier: 1.5,
  windSmoothingFactor: 0.5,
  enableExplosions: false,
  enableWildcard: false,
  enableDegradation: false,
  enableHardDegradation: false,
  enableWildcardColor: false,
  degradationKnockback: 1,
  degradationWindImmunityDuration: 1000,
  enableVariableVoidSize: true, // Master switch to turn this feature on/off.
  drawWindCurve: false,
  enableDangerHighlight: false,
  dangerHighlightMinLevel: 2, // Only highlight potential collisions for balls of this level or higher
  dangerHighlightBlur: 25, // The blur radius of the glow
  dangerHighlightMaxDistance: 100,
  enableLivesSystem: false,
  minLevelToLoseLife: 1,
  initialLives: 3,
  enableLifeLossAnimation: false,
  lifeLossAnimationDuration: 400, // How long the effect lasts in ms
  screenShakeMagnitude: 6, // How intense the screen shake is in pixels
  highestScoreAnimationDuration: 1000, // Duration in ms
  highestScoreFlashColor: "#FFD700", // A gold color for the flash
  enableSimpleCombinationMode: false,
  sizeIncreasePerLevel: 0.1,
  enableWindCombination: false,
  enableWindSparkles: false,
  windCombinationChargeTime: 1500,
  enableBallBorder: true,
  enableBallFill: true,
  invertColors: false,
  strokeColors: false,
  gravityMassEffect: 1.0,
  enableZeroGravityMode: true,
  windGravityImmunityDuration: 1500, // How long immunity lasts in ms
  glitterParticleRate: 0.4, // Chance to spawn a glitter particle per frame (0 to 1)
  glitterParticleLifetime: 400, // How long each glitter particle lasts
  levitationLevelMultiplier: 1000, // How long each glitter particle lasts
  // Stable parameters.
  ballTrailLength: 120, // How many points to store in the trail.
  ballTrailStartWidth: 1, // The width of the trail at its oldest point (in pixels).
  ballTrailEndWidth: 3, // The width of the trail right behind the symbol.
  ballTrailOpacity: 0.003,
  highestLevelAnimationDuration: 3000,
  constructionAnimationDuration: 400,
  enableParticleBouncing: true,
  particleBounceFactor: 0.3, // How strongly particles bounce off symbols
  gloryParticlesNeededForUpgrade: 10,
  particleCollisionKnockback: 0.5,
  windParticlesPerFrame: 1, // How many particles to spawn each frame along the curve
  windParticleSpread: 30,
  windParticleLifetime: 2000, // How long each particle lasts in ms
  windParticleSpawnRate: 3, // How many particles to spawn per recorded mouse point
  windParticleBaseSpeed: 1.5, // The base speed for particles flowing along the curve
  windParticleSpeedVariance: 1.0, // Randomness added to the speed
  windParticleTrailLength: 40,
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
  highestLevelParticleCount: 100,
  highestLevelParticleSpeed: 10,
  highestLevelParticleLifetime: 2500, // Make them last longer
  lifeSymbolFallSpeedMultiplier: 1.5, // Makes it fall 50% faster than normal
  lifeSymbolSpawnRate: 0.0,
  maxLives: 5, // The maximum number of lives the player can have
  scorePopupLifetime: 1200, // How long the text stays on screen (in ms)
  scorePopupFontSize: 22, // The starting font size in pixels
  scorePopupUpwardSpeed: -0.8, // The initial upward velocity

  // Canvas background is a special case, handled in script.js, but we'll define it here.
  backgroundColor: {
    normal: "#444",
    inverted: "#dde1e6",
    patternColor: "rgba(128, 128, 128, 0.04)", // Subtle gray for the waves
  },

  // Symbol Colors
  symbolColor: { normal: "#FFFFFF", inverted: "#000000" },
  grabbedBallSymbolColor: { normal: "#f1c40f", inverted: "#2980b9" }, // Gold -> Strong Blue
  voidSymbolColor: {
    normal: "rgba(120, 40, 30, 0.9)",
    inverted: "rgba(231, 76, 60, 0.9)",
  }, // Keep red, but maybe brighter
  lifeSymbolColor: {
    normal: "rgba(46, 204, 113, 0.9)",
    inverted: "rgba(39, 174, 96, 1.0)",
  }, // Keep green
  lifeLeafColor: {
    normal: "rgba(46, 204, 113, 0.5)",
    inverted: "rgba(46, 204, 113, 0.5)",
  }, // Keep green
  lostLifeLeafColor: {
    normal: "rgba(50, 50, 50, 0.7)",
    inverted: "rgba(189, 195, 199, 0.8)",
  }, // Dark Gray -> Light Gray

  // Particle & Effect Colors
  windFillColor: {
    normal: "rgba(220, 235, 255, 0.7)",
    inverted: "rgba(50, 50, 80, 0.6)",
  },
  dangerHighlightColor: {
    normal: "rgba(255, 50, 50, 0.7)",
    inverted: "rgba(255, 50, 50, 0.7)",
  },
  particleConstructColor: {
    normal: { r: 200, g: 220, b: 255 },
    inverted: { r: 44, g: 62, b: 80 },
  },
  particleExplosionColor: {
    normal: { r: 255, g: 180, b: 120 },
    inverted: { r: 100, g: 30, b: 22 },
  },
  // particleExplosionColor: { r: 255, g: 180, b: 120 },
  particleDebrisColor: {
    normal: { r: 180, g: 180, b: 180 },
    inverted: { r: 80, g: 80, b: 80 },
  },
  windParticleColor: {
    normal: { r: 220, g: 235, b: 255 },
    inverted: { r: 44, g: 62, b: 80 },
  },
  highestLevelParticleColor: {
    normal: { r: 255, g: 215, b: 0 },
    inverted: { r: 60, g: 20, b: 80 },
  }, // Gold -> Dark Purple
  scorePopupColor: {
    normal: "rgba(223, 223, 223, 1)",
    inverted: "rgba(0, 0, 0, 1)",
  },

  lifeLossFlashColor: "rgba(100, 0, 0, 0.1)", // Color of the screen flash

  levelColorsGray: [
    "rgba(52, 152, 219, 0.7)", // L1: Blue
    "rgba(142, 68, 173, 0.7)", // L2: Purple
    "rgba(230, 126, 34, 0.7)", // L3: Orange
    "rgba(241, 196, 15, 0.7)", // L4: Yellow/Gold
    "rgba(168, 204, 52, 0.7)", // L5: Lime
    "rgba(231, 76, 60, 0.7)", // L6: Red
    "rgba(190, 190, 190, 0.7)", // L7: Silver
    "rgba(0, 150, 100, 0.7)", // L8: Emerald
    "rgba(255, 0, 255, 0.7)", // L9: Pink
    "rgba(0, 0, 0, 1.0)", // L10: Black <<<
  ],

  innerColors: [
    "rgba(255, 255, 255, 1.0)", // L1: White
    "rgba(255, 255, 255, 1.0)", // L2: White
    "rgba(255, 255, 255, 1.0)", // L3: White
    "rgba(255, 255, 255, 1.0)", // L4: White
    "rgba(255, 255, 255, 1.0)", // L5: White
    "rgba(255, 255, 255, 1.0)", // L6: White
    "rgba(255, 255, 255, 1.0)", // L7: Silver
    "rgba(241, 196, 15, 0.7)", // L8: Yellow/Gold
    "rgba(220, 220, 220, 0.7)", // L9: Silver
    "rgba(241, 196, 15, 0.7)", // L10: Yellow/Gold
  ],

  mandalaInnerRadius: 0.0, // The initial upward velocity
  mandalaCurveAmount: 0.35, // The initial upward velocity

  allMetalic: false,

  corruptionParticleColor: { r: 79, g: 0, b: 0 }, // A dark red
  corruptionParticleBaseCount: 30, // Multiplier for particle amount
  corruptionParticleSpeed: 1.5,
  corruptionWobbleAmplitude: 0.02,
  corruptionColorVariance: 40,

  // ADD these new properties for the corruption pool
  maxCorruptionLevel: 2000, // The pool level that triggers a game over
  poolMaxHeight: 0.25, // The max height of the pool (60% of the screen)
  poolColor: "rgba(192, 57, 43, 0.4)", // Base color of the pool

  // For the wave effect
  // poolWaveAmplitude: 1,
  // poolWaveFrequency: 0.03,
  // poolWaveSpeed: 0.01,

  poolWaveLayers: [
    {
      amplitude: 8,
      frequency: 0.01,
      speed: 0.001,
      color: "rgba(80, 20, 20, 0.6)",
    },
    // Layer 2: Middle
    {
      amplitude: 2,
      frequency: 0.01,
      speed: -0.003,
      color: "rgba(120, 40, 30, 0.7)",
    },
    // Layer 3: Bottom-most, slowest, most opaque
    {
      amplitude: 1,
      frequency: 0.03,
      speed: 0.003,
      color: "rgba(80, 20, 20, 0.8)",
    },
  ],

  // For the splash effect
  splashParticleCount: 1,
  splashParticleSpeed: 2,
  splashParticleLifetime: 500,
  poolRiseSpeed: 0.01,

  gloryParticleColor: { r: 255, g: 223, b: 0 }, // A rich gold color
  gloryParticleBaseCount: 10,
  gloryParticleSpeed: 1.5,

  poolShineColor: { r: 255, g: 255, b: 200 }, // A bright yellow-white for the shine
  poolShineParticleCount: 1,
  poolShineParticleSpeed: 1,
  poolShineParticleLifetime: 400,

  poolShineIntensityPerParticle: 0.01, // How much brightness each glory particle adds (capped at 1.0)
  poolShineFadeSpeed: 0.01, // How quickly the shine fades per frame
  poolShineColor: "rgba(180, 180, 145, 0.7)", // A bright, glowing yellow-white

  l10SymbolPositions: [
    // Normalized coordinates for the 3 sockets
    { x: 0.25, y: 0.2 }, // 25% from left, 10% from top
    { x: 0.5, y: 0.2 }, // Center, 10% from top
    { x: 0.75, y: 0.2 }, // 75% from left, 10% from top
  ],
  l10AttractionSpeed: 0.02, // How quickly L10 balls move to their socket

  lotusAnimationDuration: 10000, // Total duration of the animation in ms
  lotusPointBonus: 1000,

  showL10SlotsInBg: true,
  l10SlotColor: "rgba(0, 0, 0, 0.15)", // A dark, subtle gray
  l10SlotLineWidth: 3,

  corruptionPerParticle: 0.5, // How many points of corruption each corruption particle adds
  purificationPerParticle: 1, // How many points of corruption each glory particle removes

  voidTrailColor: "rgba(150, 40, 40, 0.7)", // A dark, smoky red
  voidTrailStartWidth: 0,
  voidTrailEndWidth: 15,
  voidTrailOpacity: 0.05,
  voidTrailWobbleFrequency: 15.0, // How many waves appear in the trail
  voidTrailWobbleAmplitude: 10.0, // How wide the wobbles are in pixels
  voidTrailWobbleSpeed: 15,
  enableHorizontalKick: true,
  voidParticleCount: 50,
  enableMetallicShield: true,
  metallicShieldBreakColor: { r: 255, g: 255, b: 255 }, // A bright, silvery-blue
  windCaptureTimer: 500,

  enableAngleSnapping: true,
  maxWindCurveAngle: 120, // The maximum angle (in degrees) allowed before the curve breaks.

  angleSnapParticleCount: 25,
  angleSnapParticleColor: { r: 255, g: 255, b: 255 }, // A sharp white
  angleSnapParticleSpeed: 4,
  windAngleLookback: 4,

  enableSidewaysWindEffect: true,
  sidewaysWindParticleRate: 1, // How many lines to spawn per second
  sidewaysWindParticleSpeed: 1.5, // Horizontal speed of the lines
  sidewaysWindParticleColor: {
    normal: "rgba(255, 255, 255, 0.1)",
    inverted: "rgba(0, 0, 0, 0.1)",
  },
  sidewaysWindWobbleFrequency: 0.01, // Controls the "waviness" of the lines
  sidewaysWindLineWidth: 2, // Controls the "waviness" of the lines
  sidewaysWindWobbleAmplitude: 10, // Controls the height of the waves
  sidewaysWindParticleTrailLength: 300, // Controls the height of the waves

  enableLosePoints: false,
  lotusAnimationPreDelay: 2000,
  poolMaxHeightLineColor: "rgba(0, 0, 0, 0.05)",
};

const mobileOverrides = {
  terminalVelocity: 0.4,
  ballCreationInterval: 1300,
  baseBallRadius: 11,
  Debris_Particle_Speed: 0.5,
  voidSymbolSpawnRate: 0.15,
  voidParticleCount: 83,
  // highestLevelParticleCount: 50,
  // highestLevelParticleSpeed: 4,
};

const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;

export const Config = isMobile
  ? { ...baseConfig, ...mobileOverrides }
  : baseConfig;
