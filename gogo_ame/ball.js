import { spawnParticles, updateAndDrawParticles } from "./particles.js";
import { drawMandala, adjustColor, createMetallicGradient } from "./drawing.js";
import {
  mandalaDefinitions,
  symbolDefinitions,
  L1_SYMBOLS,
} from "./symbols.js";
import { Config } from "./Config.js";
import { canvasWidth, canvasHeight, ctx } from "./ui.js";
import { handleLifeLoss } from "./game_state.js";
import { GameState } from "./game_state.js";
import { degradeBall } from "./mechanics.js";

export class Ball {
  constructor(x, y, actualRadius, initialSymbolId, isBlack) {
    this.id = Date.now() + Math.random();
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = actualRadius;
    this.symbolId = initialSymbolId;
    this.level = symbolDefinitions[initialSymbolId].level;
    this.isGrabbed = false;
    this.isBlack = false;
    this.grabStartX = 0;
    this.grabStartY = 0;
    this.slingshotVector = { x: 0, y: 0 };
    this.isConstructing = true;
    this.createdAt = Date.now();
    this.trail = [];
    this.windImmuneUntil = 0;
    this.isDangerous = false;
    this.isCapturedByWind = false;
    this.hasBeenInPlayfield = false;
    this.hasBeenManipulated = false;
    this.gravityImmuneUntil = 0;
  }

  drawSlingshot() {
    if (
      this.isGrabbed &&
      (this.slingshotVector.x !== 0 || this.slingshotVector.y !== 0)
    ) {
      ctx.beginPath();
      ctx.strokeStyle = Config.slingshotArrowColor;
      ctx.lineWidth = 3;

      const arrowStartX = this.x;
      const arrowStartY = this.y;
      const arrowEndX = this.x + this.slingshotVector.x;
      const arrowEndY = this.y + this.slingshotVector.y;

      // Draw line
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(arrowEndX, arrowEndY);

      // Draw arrowhead
      const angle = Math.atan2(
        arrowEndY - arrowStartY,
        arrowEndX - arrowStartX
      );
      ctx.lineTo(
        arrowEndX - 15 * Math.cos(angle - Math.PI / 6),
        arrowEndY - 15 * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(arrowEndX, arrowEndY);
      ctx.lineTo(
        arrowEndX - 15 * Math.cos(angle + Math.PI / 6),
        arrowEndY - 15 * Math.sin(angle + Math.PI / 6)
      );

      ctx.stroke();
      ctx.closePath();
    }
  }

  draw(cfg) {
    if (
      Date.now() < this.gravityImmuneUntil &&
      Math.random() < cfg.glitterParticleRate
    ) {
      // Spawn a short-lived, non-moving, golden particle just below the ball
      const angle = Math.random() * Math.PI; // Spawn in a half-circle below
      const spawnX =
        this.x + Math.cos(angle + Math.PI / 2) * (this.radius * Math.random());
      const spawnY = this.y + this.radius + Math.random() * 5;

      spawnParticles(
        1, // Spawn just one particle
        spawnX,
        spawnY,
        cfg.invertColors
          ? cfg.highestLevelParticleColor.inverted
          : cfg.highestLevelParticleColor.normal,
        0, // No speed
        1, // minSize
        3, // maxSize
        cfg.glitterParticleLifetime
      );
    }

    const isInverted = cfg.invertColors;

    if (
      Config.enableWindSparkles &&
      this.isCapturedByWind &&
      Math.random() < 0.3
    ) {
      const angle = Math.random() * Math.PI * 2;
      const sparkRadius = this.radius + 5;
      const sparkX = this.x + Math.cos(angle) * sparkRadius;
      const sparkY = this.y + Math.sin(angle) * sparkRadius;
      ctx.fillStyle = "rgba(255, 255, 220, 0.9)"; // A bright yellow-white
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, Math.random() * 2 + 1, 0, 2 * Math.PI);
      ctx.fill();
    }

    if (this.isDangerous) {
      ctx.save();
      // Use the ball's path to create a blurred shape
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      // Apply the "blur" effect using shadows
      ctx.shadowBlur = cfg.dangerHighlightBlur;
      ctx.shadowColor = cfg.dangerHighlightColor;
      // The fill makes the shadow visible; its own color doesn't matter.
      ctx.fillStyle = cfg.dangerHighlightColor;
      ctx.fill();
      ctx.restore(); // Restore context to remove shadow for other drawings
    }

    const enableBallTrails =
      cfg.enableBallTrails &&
      (this.symbolId !== "S1_VOID" || cfg.enableBallTrailsForVoid);
    if (enableBallTrails && this.trail.length > 0) {
      for (let i = 0; i < this.trail.length; i++) {
        const trailPoint = this.trail[i];
        // progress = 0 for the oldest point, 1 for the newest (closest to the ball)
        const progress = i / (this.trail.length - 1);

        // Interpolate size and opacity to make the trail grow towards the ball
        const currentRadius =
          cfg.ballTrailStartWidth +
          (cfg.ballTrailEndWidth - cfg.ballTrailStartWidth) * progress;
        const currentAlpha = cfg.ballTrailOpacity;

        // Use the ball's main fill color for the trail
        ctx.fillStyle = isInverted
          ? cfg.symbolColor.inverted
          : cfg.symbolColor.normal;

        // Set opacity and draw the trail segment
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(trailPoint.x, trailPoint.y, currentRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
      // Reset global alpha so it doesn't affect other drawings
      ctx.globalAlpha = 1.0;
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    // --- Determine color based on level and isBlack ---
    let fillColor;
    const lightColors = cfg.levelColorsGray;

    if (this.level >= 1) {
      fillColor = lightColors[this.level - 1] || lightColors[0];
    } else {
      fillColor = lightColors[0];
    }

    if (this.symbolId === "S1_VOID") {
      fillColor = isInverted
        ? cfg.voidSymbolColor.inverted
        : cfg.voidSymbolColor.normal;
    } else if (this.symbolId === "S1_LIFE") {
      fillColor = isInverted
        ? cfg.lifeSymbolColor.inverted
        : cfg.lifeSymbolColor.normal;
    }

    const enableBallFill = true;
    const enableBallBorder = false;
    const isMetallic = cfg.allMetallic || this.level >= 7;
    if (enableBallFill) {
      if (isMetallic) {
        const ballGradient = createMetallicGradient(
          ctx,
          this.x,
          this.y,
          this.radius,
          fillColor
        );
        ctx.fillStyle = ballGradient;
        ctx.fill();
      } else {
        ctx.fillStyle = fillColor;
      }
      ctx.fill();
    }

    if (enableBallBorder) {
      if (cfg.strokeColors) {
        ctx.strokeStyle = fillColor;
      } else {
        ctx.strokeStyle =
          isInverted && !cfg.enableBallFill
            ? cfg.symbolColor.inverted
            : cfg.symbolColor.normal;
      }
      ctx.stroke();
    }

    ctx.closePath();

    const mandalaDef = mandalaDefinitions[this.symbolId];
    if (mandalaDef && mandalaDef.mandalaConfig) {
      const config = mandalaDef.mandalaConfig;

      const finalSpikeDistance = config.spikeDistance * this.radius;
      let currentSpikeDistance = finalSpikeDistance;

      let mandalaColor =
        isInverted && !cfg.enableBallFill
          ? cfg.symbolColor.inverted
          : cfg.symbolColor.normal;

      if (this.isConstructing) {
        const elapsedTime = Date.now() - this.createdAt;
        const progress = Math.min(
          1.0,
          elapsedTime / Config.constructionAnimationDuration
        );

        // The spike distance grows based on the animation's progress
        currentSpikeDistance = finalSpikeDistance * progress;

        if (progress >= 1.0) {
          this.isConstructing = false; // End the animation
        }
      }

      if (cfg.strokeColors) {
        ctx.fillStyle = fillColor;
        drawMandala(
          ctx,
          this.x,
          this.y,
          config.innerRadius * this.radius, // Scale by ball radius
          config.numPoints,
          currentSpikeDistance,
          config.leafType,
          fillColor,
          null,
          config.curveAmount * this.radius, // Scale by ball radius
          config.fillStyle
        );
        return;
      }

      let engravingShadow = adjustColor(fillColor, -50); // 50% darker for the shadow

      const innerColors = cfg.innerColors;

      let innerColor = innerColors[0];
      if (this.level >= 1) {
        innerColor = innerColors[this.level - 1] || lightColors[0];
      }
      let engravingHighlight = innerColor;

      if (!isMetallic) {
        engravingShadow =
          isInverted && !cfg.enableBallFill
            ? cfg.symbolColor.inverted
            : cfg.symbolColor.normal;
        engravingHighlight = null;
      }
      drawMandala(
        ctx,
        this.x,
        this.y,
        config.innerRadius * this.radius,
        config.numPoints,
        currentSpikeDistance,
        config.leafType,
        engravingShadow,
        engravingHighlight,
        config.curveAmount * this.radius,
        config.fillStyle,
        undefined, // lineWidth
        isMetallic ? adjustColor(fillColor, -50) : undefined
      );
    }
  }

  applyGrab() {
    this.x += this.vx;
    this.y += this.vy;
    this.x = Math.max(this.radius, Math.min(this.x, canvasWidth - this.radius));
    this.y = Math.max(
      this.radius,
      Math.min(this.y, canvasHeight - this.radius)
    );
    if (this.x === this.radius || this.x === canvasWidth - this.radius)
      this.vx = 0;
    if (this.y === this.radius || this.y === canvasHeight - this.radius)
      this.vy = 0;
  }

  applyGravity(cfg) {
    if (Date.now() < this.gravityImmuneUntil) {
      return;
    }

    if (cfg.enableZeroGravityMode && this.level > 1) {
      this.y += cfg.terminalVelocitySymbol;
      return;
    }

    if (this.symbolId === "S1_VOID") {
      this.y += cfg.voidSpeedMultiplier * cfg.terminalVelocity;
    } else if (this.symbolId === "S1_LIFE") {
      this.y += cfg.lifeSymbolFallSpeedMultiplier * cfg.terminalVelocity;
    } else {
      let massFactor = this.radius / cfg.baseBallRadius;
      const fullMassEffect = 1 / massFactor;
      massFactor = 1 + (fullMassEffect - 1) * cfg.gravityMassEffect;
      this.y += massFactor * cfg.terminalVelocity;
    }
  }

  applyFriction(cfg) {
    this.vx *= cfg.friction;
    this.vy *= cfg.friction;
  }

  // From wind curve.
  findClosestPointInWindCurve(cfg) {
    const curvePoints = GameState.windCurve.points;

    let closestDist = Infinity;
    let closestPoint = null;
    let curveDirection = { x: 0, y: 0 };
    let segmentIndex = -1; // NEW: Keep track of which segment is closest

    // 1. Find the closest point on the entire wind curve to the ball
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const p1 = curvePoints[i];
      const p2 = curvePoints[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

      if (dx === 0 && dy === 0) continue;

      const t =
        ((this.x - p1.x) * dx + (this.y - p1.y) * dy) / (dx * dx + dy * dy);

      let currentClosest;
      if (t < 0) {
        currentClosest = p1;
      } else if (t > 1) {
        currentClosest = p2;
      } else {
        currentClosest = { x: p1.x + t * dx, y: p1.y + t * dy };
      }

      const dist = Math.sqrt(
        (this.x - currentClosest.x) ** 2 + (this.y - currentClosest.y) ** 2
      );

      if (dist < closestDist) {
        closestDist = dist;
        closestPoint = currentClosest;
        const mag = Math.sqrt(dx * dx + dy * dy);
        curveDirection = { x: dx / mag, y: dy / mag };
        segmentIndex = i; // Store the index of the closest segment
      }
    }

    if (closestDist < cfg.windInfluenceRadius) {
      return [closestPoint, closestDist, segmentIndex, curveDirection];
    }
    return [null, Infinity, -1, curveDirection];
  }

  applyWindForce(cfg) {
    if (Date.now() < this.windImmuneUntil) return;
    if (!GameState.windCurve) return;
    if (this.symbolId === "S1_VOID") return;

    const curvePoints = GameState.windCurve.points;
    if (curvePoints.length < 2) return;

    let [closestPoint, closestDist, segmentIndex, curveDirection] =
      this.findClosestPointInWindCurve(cfg);

    // 2. If the closest point is within the influence radius, apply forces
    if (closestPoint && segmentIndex !== -1) {
      this.gravityImmuneUntil = Date.now() + cfg.windGravityImmunityDuration + cfg.levitationLevelMultiplier * this.level;

      this.isCapturedByWind = true;
      this.hasBeenManipulated = true;
      GameState.windCapturedBalls.push(this.id);

      let massFactor = this.radius / cfg.baseBallRadius;
      const fullMassEffect = 1 / massFactor;
      massFactor = 1 + (fullMassEffect - 1) * cfg.gravityMassEffect;

      const progress = segmentIndex / (curvePoints.length - 1);
      const falloff = 1.0 - progress * cfg.windForceFalloff;
      const strengthMultiplier = Math.max(0, falloff); // Ensure strength doesn't go below zero

      const normalDx = closestPoint.x - this.x;
      const normalDy = closestPoint.y - this.y;

      let couplingForce = cfg.windCouplingStrength;

      // If the ball is within the arrival distance, ramp down the force.
      if (closestDist < cfg.windArrivalDistance) {
        // This creates a scaling factor from 0 to 1 inside the arrival zone.
        couplingForce *= closestDist / cfg.windArrivalDistance;
      }

      // Apply the smoothly ramped coupling force.
      this.vx += normalDx * couplingForce * strengthMultiplier * massFactor;
      this.vy += normalDy * couplingForce * strengthMultiplier * massFactor;

      // B. The Tangential Force (Propulsion) - Guides the ball's SPEED along the line
      const speedAlongCurve =
        this.vx * curveDirection.x + this.vy * curveDirection.y;

      if (speedAlongCurve < cfg.windMaxSpeed) {
        const forceMagnitude =
          (cfg.windMaxSpeed - speedAlongCurve) * cfg.windStrength;
        // Apply the falloff multiplier to the tangential force
        this.vx +=
          curveDirection.x * forceMagnitude * strengthMultiplier * massFactor;
        this.vy +=
          curveDirection.y * forceMagnitude * strengthMultiplier * massFactor;
      }
    }
  }

  // From environmental wind.
  applySidewaysWind(cfg) {
    if (cfg.enableZeroGravityMode && this.level > 1) {
      return;
    }

    if (Date.now() < this.windImmuneUntil) return;

    // Void symbols remain immune to the wind
    if (this.symbolId === "S1_VOID") {
      return;
    }

    // Convert total elapsed time from milliseconds to seconds for more intuitive frequency values
    const timeInSeconds = GameState.totalElapsedTime / 1000;

    // --- Calculate the time-based oscillation ---
    // We use two sine waves with different frequencies and add them together.
    // This creates a much more natural, less repetitive pattern than a single sine wave.
    const oscillation1 = Math.sin(
      timeInSeconds * cfg.windOscillationFrequency1
    );
    const oscillation2 = Math.sin(
      timeInSeconds * cfg.windOscillationFrequency2
    );

    // Combine the oscillations and scale by the amplitude
    const totalOscillation =
      ((oscillation1 + oscillation2) / 2) * cfg.windOscillationAmplitude;

    // The final wind is the base strength from the slider plus the current oscillation
    const currentWindStrength = cfg.sidewaysWindStrength + totalOscillation;

    this.vx += currentWindStrength;
  }

  doVerticalBoundaryCheck(cfg) {
    if (this.y > 50 || this.hasBeenInPlayfield) {
      this.hasBeenInPlayfield = true;
    }

    const collidesTop = this.y - this.radius < 0 && this.hasBeenInPlayfield;
    const collidesBottom = this.y + this.radius > canvasHeight;

    if (collidesTop || collidesBottom) {
      // If degradation is on and the ball is high enough level, degrade it
      if (cfg.enableHardDegradation && this.level > 1) {
        const knockbackSource = {
          x: this.x,
          // Knockback comes from beyond the wall that was hit
          y: collidesTop ? -this.radius : canvasHeight + this.radius,
        };
        degradeBall(this, knockbackSource);
        return true; // Signal for removal (as it's being replaced)
      }

      // --- FALLBACK DESTRUCTION LOGIC ---
      // This runs for Level 1 balls or if degradation is off
      if (Config.enableLivesSystem && this.level > Config.minLevelToLoseLife) {
        handleLifeLoss();
      }

      spawnParticles(
        10,
        this.x,
        collidesTop ? 5 : canvasHeight - 5, // Spawn particles at the correct edge
        this.isBlack
          ? Config.particleDebrisColor.normal // Assuming default colors here
          : Config.particleConstructColor.normal,
        2,
        1,
        3
      );
      return true; // Signal for removal
    }

    return false; // No collision
  }

  doHorizontalBoundaryCheck(cfg) {
    const collidesLeft = this.x - this.radius < 0;
    const collidesRight = this.x + this.radius > canvasWidth;

    if (collidesLeft || collidesRight) {
      if (cfg.enableLivesSystem && this.level > Config.minLevelToLoseLife) {
        handleLifeLoss();
      }

      // Only attempt to degrade the ball if the feature is on AND the ball is Level 2 or higher.
      if (cfg.enableHardDegradation && this.level > 1) {
        const knockbackSource = {
          x: collidesLeft ? -this.radius : canvasWidth + this.radius,
          y: this.y,
        };
        const didDegrade = degradeBall(this, knockbackSource);

        return true; // Signal for removal (as it's being replaced).
      }

      spawnParticles(
        10,
        this.x < this.radius ? 5 : canvasWidth - 5,
        this.y,
        cfg.invertColors
          ? cfg.particleConstructColor.inverted
          : cfg.particleConstructColor.normal,
        2,
        1,
        3
      );

      return true; // Signal for removal.
    }

    return false;
  }

  update(cfg) {
    // if (this.isGrabbed) {
    //   this.applyGrab();
    //   // return true;
    // }
    this.trail.push({ x: this.x, y: this.y });

    // Keep the trail from getting too long by removing the oldest point
    if (this.trail.length > cfg.ballTrailLength) {
      this.trail.shift();
    }

    this.applyGravity(cfg);
    this.applyWindForce(cfg);
    this.applySidewaysWind(cfg);

    this.applyFriction(cfg);

    this.y += this.vy;
    this.x += this.vx;

    if (
      this.doVerticalBoundaryCheck(cfg) ||
      this.doHorizontalBoundaryCheck(cfg)
    ) {
      return false;
    }

    return true;
  }
}
