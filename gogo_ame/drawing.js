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
 * @param {string} fillStyle - The rendering style ('lines', 'solid', 'dotted').
 */
export function drawMandala(
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
  // (The full code of your drawMandala function goes here)
  // ...
  ctx.save();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.fillStyle = color;

  if (fillStyle === "dotted") {
    const patternCanvas = document.createElement("canvas");
    const patternCtx = patternCanvas.getContext("2d");
    patternCanvas.width = 10;
    patternCanvas.height = 10;

    patternCtx.fillStyle = color;
    patternCtx.beginPath();
    patternCtx.arc(5, 5, 2, 0, 2 * Math.PI);
    patternCtx.fill();

    ctx.fillStyle = ctx.createPattern(patternCanvas, "repeat");
  }

  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  if (fillStyle === "lines") {
    ctx.stroke();
  } else {
    ctx.fill();
  }

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

    if (fillStyle === "lines") {
      ctx.beginPath();
      if (leafType === "right" || leafType === "both") {
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.stroke();
      }
      ctx.beginPath();
      if (leafType === "left" || leafType === "both") {
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX_inv, cpY_inv, endX, endY);
        ctx.stroke();
      }
    } else {
      if (leafType === "both") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.quadraticCurveTo(cpX_inv, cpY_inv, startX, startY);
        ctx.fill();
      } else {
        if (leafType === "right") {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(cpX, cpY, endX, endY);
          ctx.closePath();
          ctx.fill();
        }
        if (leafType === "left") {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(cpX_inv, cpY_inv, endX, endY);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }
  ctx.restore();
}
