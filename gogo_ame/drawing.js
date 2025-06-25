export function adjustColor(color, percent) {
  // Regular expression to parse R, G, B, and optional A values
  const rgbaMatch = color.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
  );

  if (!rgbaMatch) {
    // If parsing fails, return a default color to avoid crashing
    console.error("Invalid color format provided to adjustColor:", color);
    return "rgba(0, 0, 0, 1.0)";
  }

  // Extract R, G, B values from the matched groups
  let [, R, G, B] = rgbaMatch.map(Number);

  // Clamp the percentage to the valid range [-100, 100]
  percent = Math.min(100, Math.max(-100, percent));

  // Determine the target color (white for lightening, black for darkening)
  const targetR = percent > 0 ? 255 : 0;
  const targetG = percent > 0 ? 255 : 0;
  const targetB = percent > 0 ? 255 : 0;

  // Calculate the blend amount (0.0 to 1.0)
  const amount = Math.abs(percent) / 100;

  // Blend each channel towards the target color
  R = Math.round(R * (1 - amount) + targetR * amount);
  G = Math.round(G * (1 - amount) + targetG * amount);
  B = Math.round(B * (1 - amount) + targetB * amount);

  // Return the new color as an opaque RGBA string for a solid metallic look
  return `rgba(${R}, ${G}, ${B}, 1.0)`;
}

export function createMetallicGradient(
  ctx,
  x,
  y,
  radius,
  baseColor,
  highlightColor = "#FFFFFF"
) {
  const highlightX = x - radius * 0.4;
  const highlightY = y - radius * 0.4;

  const gradient = ctx.createRadialGradient(
    highlightX,
    highlightY,
    radius * 0.1, // Start circle (the highlight)
    x,
    y,
    radius // End circle (the full shape)
  );

  // Get shadow colors from our existing helper
  const shadowColor = adjustColor(baseColor, -60);
  const edgeColor = adjustColor(baseColor, -85);

  // Add the color stops to create the effect
  gradient.addColorStop(0, highlightColor);
  gradient.addColorStop(0.5, baseColor);
  gradient.addColorStop(0.95, shadowColor);
  gradient.addColorStop(1, edgeColor);

  return gradient;
}

export function drawMandala(
  ctx,
  centerX,
  centerY,
  innerRadius,
  numPoints,
  spikeDistance,
  leafType,
  shadowColor, // The main color is now the shadow
  highlightColor, // A new color for the highlight pass
  curveAmount,
  fillStyle,
  lineWidth,
  baseColor
) {
  // If no highlightColor is provided, fall back to the old single-color drawing.
  if (!highlightColor) {
    // This block is for the simple, flat drawing (like when cfg.strokeColors is true)
    ctx.save();
    ctx.strokeStyle = shadowColor; // shadowColor is the only color in this case
    ctx.lineWidth = lineWidth || 1.5;
    ctx.fillStyle = shadowColor;
    // The actual drawing logic is now in a helper function
    _drawMandalaPaths(
      ctx,
      centerX,
      centerY,
      innerRadius,
      numPoints,
      spikeDistance,
      leafType,
      curveAmount,
      fillStyle,
      lineWidth,
      baseColor
    );
    ctx.restore();
    return;
  }

  // --- Main Engraving Effect ---

  const baseLineWidth = lineWidth || 1.5;
  // The offset distance for the 3D effect, proportional to the line width.
  const offset = baseLineWidth * 0.5;

  centerX -= offset;
  centerY -= offset;

  // 1. SHADOW PASS (offset toward the top-left light source)
  ctx.save();
  ctx.translate(-offset, -offset);
  ctx.strokeStyle = shadowColor;
  ctx.lineWidth = baseLineWidth;
  ctx.fillStyle = shadowColor;
  _drawMandalaPaths(
    ctx,
    centerX,
    centerY,
    innerRadius,
    numPoints,
    spikeDistance,
    leafType,
    curveAmount,
    fillStyle,
    lineWidth
  );
  ctx.restore();

  ctx.save();
  ctx.translate(offset, offset);

  // 2. HIGHLIGHT PASS (offset away from the light source)
  let lighterHighlight = adjustColor(highlightColor, 75);
  const highlightStyle = createMetallicGradient(
    ctx,
    centerX,
    centerY,
    spikeDistance + 10,
    highlightColor,
    lighterHighlight
  );

  ctx.lineWidth = baseLineWidth;
  ctx.strokeStyle = highlightStyle;
  ctx.fillStyle = highlightStyle;
  _drawMandalaPaths(
    ctx,
    centerX,
    centerY,
    innerRadius,
    numPoints,
    spikeDistance,
    leafType,
    curveAmount,
    fillStyle,
    lineWidth
  );
  ctx.restore();
}

function _drawMandalaPaths(
  ctx,
  centerX,
  centerY,
  innerRadius,
  numPoints,
  spikeDistance,
  leafType,
  curveAmount,
  fillStyle,
  lineWidth
) {
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
  if (fillStyle === "lines" || fillStyle === "lines_with_spokes") {
    ctx.stroke();
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

    if (fillStyle === "lines" || fillStyle === "lines_with_spokes") {
      if (fillStyle === "lines_with_spokes") {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY); // From the absolute center
        ctx.lineTo(endX, endY); // To the base of the leaf
        ctx.stroke();
      }

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
}
