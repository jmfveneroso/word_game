import { spawnParticles, updateAndDrawParticles } from "./particles.js";
import { mandalaDefinitions, symbolDefinitions, L1_SYMBOLS } from "./symbols.js";
import { Config } from "./Config.js";
import { canvasWidth, canvasHeight, ctx } from "./ui.js";
import { handleLifeLoss } from "./game_state.js";

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

  /**
    * Draws a mandala-like figure on a canvas context.
    * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
    * @param {number} centerX - The x-coordinate of the mandala's center.
    * @param {number} centerY - The y-coordinate of the mandala's center.
    * @param {number} innerRadius - The radius of the central circle.
    * @param {number} numPoints - The number of leaves or spikes.
    * @param {number} spikeDistance - The distance of the leaf tip from the center.
    * @param {string} leafType - Determines the curve direction ('left', 'right', or 'both').
    * @param {string} color - The color of the figure.
    * @param {number} curveAmount - A value controlling how much the leaves bend.
    @param {string} fillStyle - The rendering style ('lines', 'solid', 'stripes').
  */
  drawMandala(
    ctx,
    centerX,
    centerY,
    innerRadius,
    numPoints,
    spikeDistance,
    leafType,
    color,
    curveAmount,
    fillStyle
  ) {
    // Save the current state of the context to avoid side effects
    ctx.save();
  
    // --- NEW: LOGIC FOR FILL STYLE ---
    // Set drawing styles based on the chosen fill style
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5; // Slightly thicker for better visibility of lines
  
    // Default fill is solid color
    ctx.fillStyle = color;
  
    // If the style is stripes, create a pattern and use it as the fill style
    if (fillStyle === "stripes") {
      const patternCanvas = document.createElement('canvas');
      const patternCtx = patternCanvas.getContext('2d');
      patternCanvas.width = 8;
      patternCanvas.height = 8;
  
      patternCtx.strokeStyle = color;
      patternCtx.lineWidth = 1.5;
      patternCtx.beginPath();
      patternCtx.moveTo(0, 8);
      patternCtx.lineTo(8, 0);
      patternCtx.moveTo(-2, 2);
      patternCtx.lineTo(2, -2);
      patternCtx.moveTo(6, 10);
      patternCtx.lineTo(10, 6);
      patternCtx.stroke();
  
      ctx.fillStyle = ctx.createPattern(patternCanvas, 'repeat');
    }
    // --- END OF NEW LOGIC ---
  
    // 1. Draw Inner Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    // --- MODIFIED: Apply fill or stroke based on style ---
    if (fillStyle === 'lines') {
        ctx.stroke();
    } else { // 'solid' or 'stripes'
        ctx.fill();
    }
  
    // 2. Draw Leaves/Spikes
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
  
      const startX = centerX + innerRadius * Math.cos(angle);
      const startY = centerY + innerRadius * Math.sin(angle);
      const endX = centerX + spikeDistance * Math.cos(angle);
      const endY = centerY + spikeDistance * Math.sin(angle);
  
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      const anglePerp = angle + Math.PI / 2;
  
      const cpX = midX + curveAmount * Math.cos(anglePerp);
      const cpY = midY + curveAmount * Math.sin(anglePerp);
      const cpX_inv = midX - curveAmount * Math.cos(anglePerp);
      const cpY_inv = midY - curveAmount * Math.sin(anglePerp);
  
      // --- MODIFIED: Different path creation for lines vs. filled shapes ---
      if (fillStyle === 'lines') {
        // For 'lines' style, draw open curves just like before
        ctx.beginPath();
        if (leafType === "right" || leafType === "both") {
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(cpX, cpY, endX, endY);
          ctx.stroke();
        }
        ctx.beginPath(); // new path for the other side to avoid connecting lines
        if (leafType === "left" || leafType === "both") {
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(cpX_inv, cpY_inv, endX, endY);
          ctx.stroke();
        }
      } else {
        // For 'solid' or 'stripes', create closed paths to fill
        if (leafType === "both") {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(cpX, cpY, endX, endY);
          // Curve back on the other side to create a closed leaf shape
          ctx.quadraticCurveTo(cpX_inv, cpY_inv, startX, startY);
          ctx.fill();
        } else {
          if (leafType === "right") {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(cpX, cpY, endX, endY);
            ctx.closePath(); // Connects end point back to start point
            ctx.fill();
          }
          if (leafType === "left") {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(cpX_inv, cpY_inv, endX, endY);
            ctx.closePath(); // Connects end point back to start point
            ctx.fill();
          }
        }
      }
    }
  
    // Restore the context to its original state
    ctx.restore();
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
      this.drawMandala(
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

    this.drawSlingshot();
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
    this.y += cfg.terminalVelocity;
  }

  applyFriction(cfg) {
    this.vx *= cfg.friction;
    this.vy *= cfg.friction;
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
    if (this.isGrabbed) {
      this.applyGrab();
      // return true;
    }

    this.applyGravity(cfg);
    this.applyFriction(cfg);

    this.y += this.vy;
    this.x += this.vx;

    if (this.doBottomCheck()) return false;
    // this.doHorizontalBoundaryCheck(cfg);

    return true;
  }
}
