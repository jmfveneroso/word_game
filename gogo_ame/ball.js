import { spawnParticles, updateAndDrawParticles } from "./particles.js";
import { drawMandala } from "./drawing.js";
import {
  mandalaDefinitions,
  symbolDefinitions,
  L1_SYMBOLS,
} from "./symbols.js";
import { Config } from "./Config.js";
import { canvasWidth, canvasHeight, ctx } from "./ui.js";
import { handleLifeLoss } from "./game_state.js";
import { GameState } from "./game_state.js";

export class Ball {
  constructor(x, y, actualRadius, initialSymbolId, isBlack) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = actualRadius;
    this.symbolId = initialSymbolId;
    this.level = symbolDefinitions[initialSymbolId].level;
    this.isGrabbed = false;
    this.isBlack = isBlack;
    this.grabStartX = 0;
    this.grabStartY = 0;
    this.slingshotVector = { x: 0, y: 0 };
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

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    // --- Determine color based on level and isBlack ---
    let fillColor = Config.levelColorsGray[0]; // Default to L1 gray
    if (this.level >= 1 && this.level <= Config.levelColorsGray.length) {
      // Check level is valid index
      fillColor = this.isBlack
        ? Config.levelColorsBlack[this.level - 1]
        : Config.levelColorsGray[this.level - 1];
    } else {
      // Fallback for potentially undefined levels or future levels
      fillColor = this.isBlack
        ? Config.levelColorsBlack[0]
        : Config.levelColorsGray[0];
    }

    if (this.symbolId === "S1_VOID") {
      fillColor = Config.voidSymbolColor;
    }
    ctx.fillStyle = fillColor;
    // -------------------------------------------------

    ctx.fill();
    ctx.closePath();

    // const symbolDef = symbolDefinitions[this.symbolId];
    // const symbolChar = symbolDef.character;
    // const fontSize =
    //   (this.radius * 1.2) / Math.max(1, symbolChar.length * 0.55);
    // ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    // ctx.textAlign = "center";
    // ctx.textBaseline = "middle";
    // // Keep symbol text color consistent for contrast
    // ctx.fillStyle = this.isGrabbed
    //   ? Config.grabbedBallSymbolColor
    //   : Config.symbolColor;
    // ctx.fillText(symbolChar, this.x, this.y);

    const mandalaDef = mandalaDefinitions[this.symbolId];
    if (mandalaDef && mandalaDef.mandalaConfig) {
      const config = mandalaDef.mandalaConfig;
      const mandalaColor = this.isGrabbed
        ? Config.grabbedBallSymbolColor
        : Config.symbolColor;

      // Call the drawMandala function with scaled parameters
      drawMandala(
        ctx,
        this.x,
        this.y,
        config.innerRadius * this.radius, // Scale by ball radius
        config.numPoints,
        config.spikeDistance * this.radius, // Scale by ball radius
        config.leafType,
        mandalaColor,
        config.curveAmount * this.radius, // Scale by ball radius
        config.fillStyle
      );
    }

    // this.drawSlingshot();
  }

  doBottomCheck() {
    if (this.y + this.radius > canvasHeight) {
      if (this.isBlack) {
        handleLifeLoss(this);
      }

      spawnParticles(
        10,
        this.x,
        canvasHeight - 5,
        this.isBlack
          ? Config.particleDebrisColor
          : Config.particleConstructColor,
        2,
        1,
        3
      );
      return true;
    }
    return false;
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
    if (this.symbolId === "S1_VOID") {
      this.y += 2.0 * cfg.terminalVelocity;
    } else { 
      let multiplier = this.radius / 20.0;
      this.y += (1 / multiplier) * cfg.terminalVelocity;
    }
  }

  applyFriction(cfg) {
    this.vx *= cfg.friction;
    this.vy *= cfg.friction;
  }

  applyWindForce(cfg) {
    if (!GameState.windCurve) return;
    if (this.symbolId === "S1_VOID") return;

    const curvePoints = GameState.windCurve.points;
    if (curvePoints.length < 2) return;

    let closestDist = Infinity;
    let closestPoint = null;
    let curveDirection = { x: 0, y: 0 };

    // 1. Find the closest point on the entire wind curve to the ball
    for (let i = 0; i < curvePoints.length - 1; i++) {
      const p1 = curvePoints[i];
      const p2 = curvePoints[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;

      // If the segment has no length, skip it
      if (dx === 0 && dy === 0) continue;

      // Project the ball's position onto the line segment
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
      }
    }

    // 2. If the closest point is within the influence radius, apply forces
    // if (closestPoint && closestDist < cfg.windInfluenceRadius) {
    //   // A. The Normal Force (Coupling) - Pulls the ball TOWARDS the line
    //   const normalDx = closestPoint.x - this.x;
    //   const normalDy = closestPoint.y - this.y;

    //   this.vx += normalDx * cfg.windCouplingStrength;
    //   this.vy += normalDy * cfg.windCouplingStrength;

    //   // B. The Tangential Force (Propulsion) - Pushes the ball ALONG the line
    //   this.vx += curveDirection.x * cfg.windStrength;
    //   this.vy += curveDirection.y * cfg.windStrength;
    // }
    if (closestPoint && closestDist < cfg.windInfluenceRadius) {
      // A. The Normal Force (Coupling) - Pulls the ball TOWARDS the line's position.
      // This remains the same.
      const normalDx = closestPoint.x - this.x;
      const normalDy = closestPoint.y - this.y;
      this.vx += normalDx * cfg.windCouplingStrength;
      this.vy += normalDy * cfg.windCouplingStrength;

      // B. The Tangential Force (Propulsion) - Guides the ball's SPEED along the line.
      // This new logic prevents oscillation.

      // Calculate the ball's current speed projected onto the curve's direction
      const speedAlongCurve =
        this.vx * curveDirection.x + this.vy * curveDirection.y;

      // If the ball is slower than the max wind speed, apply a force to speed it up.
      if (speedAlongCurve < cfg.windMaxSpeed) {
        const forceMagnitude =
          (cfg.windMaxSpeed - speedAlongCurve) * cfg.windStrength;
        this.vx += curveDirection.x * forceMagnitude;
        this.vy += curveDirection.y * forceMagnitude;
      }
    }
  }

  applySidewaysWind(cfg) {
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

  doHorizontalBoundaryCheck(cfg) {
    this.vx *= Config.horizontalFriction;
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= Config.bounceEfficiency;
    } else if (this.x + this.radius > canvasWidth) {
      this.x = canvasWidth - this.radius;
      this.vx *= Config.bounceEfficiency;
    }
  }

  update(cfg) {
    // if (this.isGrabbed) {
    //   this.applyGrab();
    //   // return true;
    // }

    this.applyGravity(cfg);
    this.applyWindForce(cfg);
    this.applySidewaysWind(cfg);

    this.applyFriction(cfg);

    this.y += this.vy;
    this.x += this.vx;

    if (this.doBottomCheck()) return false;
    // this.doHorizontalBoundaryCheck(cfg);

    return true;
  }
}
