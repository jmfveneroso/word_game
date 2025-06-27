import { Config } from "./config.js";
import {
  mandalaDefinitions,
  symbolDefinitions,
  L1_SYMBOLS,
} from "./symbols.js";

export function getColorFromPalette(palette, progress) {
    const totalColors = palette.length;
    const scaledProgress = progress * (totalColors - 1);
    const index1 = Math.floor(scaledProgress);
    const index2 = Math.min(index1 + 1, totalColors - 1);
    const blend = scaledProgress - index1;

    // Helper to parse 'rgba(r,g,b,a)' strings into an array of numbers
    const parseColor = (colorStr) => colorStr.match(/\d+/g).map(Number);

    const c1 = parseColor(palette[index1]);
    const c2 = parseColor(palette[index2]);

    // Interpolate each channel (R, G, B)
    const r = c1[0] + (c2[0] - c1[0]) * blend;
    const g = c1[1] + (c2[1] - c1[1]) * blend;
    const b = c1[2] + (c2[2] - c1[2]) * blend;

    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.8)`;
}

export function adjustColor(color, percent) {
  if (typeof color !== "string") {
    console.error("Invalid color format provided to adjustColor:", color);
    return "rgba(0, 0, 0, 1.0)";
  }

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

export function drawMandala(ctx, mandalaConfigs) {
  // If no highlightColor is provided, fall back to the old single-color drawing.
  if (!mandalaConfigs.highlightColor) {
    ctx.save();
    ctx.strokeStyle = mandalaConfigs.shadowColor;
    ctx.lineWidth = mandalaConfigs.lineWidth || 1.5;
    ctx.fillStyle = mandalaConfigs.shadowColor;
    _drawMandalaPaths(ctx, mandalaConfigs);
    ctx.restore();
    return;
  }

  _engrave(ctx, mandalaConfigs);
}

function _getFillColor(level, symbolId) {
  let fillColor;
  const lightColors = Config.levelColorsGray;

  if (level >= 1) {
    fillColor = lightColors[level - 1] || lightColors[0];
  } else {
    fillColor = lightColors[0];
  }

  if (symbolId === "S1_VOID") {
    fillColor = Config.invertColors
      ? Config.voidSymbolColor.inverted
      : Config.voidSymbolColor.normal;
  } else if (symbolId === "S1_LIFE") {
    fillColor = Config.invertColors
      ? Config.lifeSymbolColor.inverted
      : Config.lifeSymbolColor.normal;
  }
  return fillColor;
}

function _calculateSpikeDistance(state, mandalaBaseConfig) {
  if (state.currentSpikeDistance) {
    return state.currentSpikeDistance;
  }

  let constructionProgress = 1.0;
  if (state.createdAt) {
    const elapsedTime = Date.now() - state.createdAt;
    const progress = Math.min(
      1.0,
      (elapsedTime / Config.constructionAnimationDuration) *
        (state.constructionAnimationDelay || 1)
    );
    constructionProgress = progress;
  }

  const finalSpikeDistance = mandalaBaseConfig.spikeDistance * state.radius;
  return finalSpikeDistance * constructionProgress;
}

function _drawMandalaPlate(ctx, state, fillColor, innerColor) {
  // Draw the background circle shape
  ctx.beginPath();
  ctx.arc(state.x, state.y, state.radius, 0, Math.PI * 2);
  ctx.closePath();

  // Apply fill (metallic or solid) if enabled
  if (state.enableBallFill) {
    const isMetallic = (state.isMetallic === undefined) ? state.mandalaConfig.isMetallic : state.isMetallic;
    if (isMetallic) {
      const ballGradient = createMetallicGradient(
        ctx,
        state.x,
        state.y,
        state.radius,
        fillColor
      );
      ctx.fillStyle = ballGradient;
    } else {
      ctx.fillStyle = fillColor;
    }
    ctx.fill();
  }

  // Apply border if enabled
  if (state.enableBallBorder) {
    ctx.strokeStyle = innerColor;
    ctx.stroke();
  }
}

export function drawMandalaBall(ctx, cfg, state) {
  const mandalaBaseConfig = state.mandalaConfig;

  const fillColor =
    state.fillColor || _getFillColor(state.level, state.symbolId);

  let innerColor =
    state.innerColor || (cfg.strokeColors
      ? fillColor
      : mandalaBaseConfig.innerColor);

  if (state.drawPlate) {
    _drawMandalaPlate(ctx, state, fillColor, innerColor);
  }

  if (!state.drawEngraving) {
    return;
  }

  const mandalaDrawConfig = {
    centerX: state.x,
    centerY: state.y,
    innerRadius: mandalaBaseConfig.innerRadius * state.radius,
    numPoints: mandalaBaseConfig.numPoints,
    spikeDistance: _calculateSpikeDistance(state, mandalaBaseConfig),
    leafType: mandalaBaseConfig.leafType,
    curveAmount: mandalaBaseConfig.curveAmount * state.radius,
    fillStyle: mandalaBaseConfig.fillStyle,
    highlightColor: innerColor,
    shadowColor: innerColor,
    lineWidth: mandalaBaseConfig.lineWidth || 1.5,
  };

  const isMetallic = (state.isMetallic === undefined) ? state.mandalaConfig.isMetallic : state.isMetallic;
  if (!isMetallic) {
    ctx.save();
    ctx.strokeStyle = mandalaDrawConfig.shadowColor;
    ctx.lineWidth = mandalaDrawConfig.lineWidth;
    ctx.fillStyle = mandalaDrawConfig.shadowColor;
    _drawMandalaPaths(ctx, mandalaDrawConfig);
    ctx.restore();
  } else {
    mandalaDrawConfig.shadowColor = adjustColor(innerColor, -50);
    _engrave(ctx, mandalaDrawConfig);
  }
}

function _engrave(ctx, mandalaConfigs) {
  mandalaConfigs.lineWidth = mandalaConfigs.lineWidth || 1.5;
  mandalaConfigs.offset = mandalaConfigs.lineWidth * 0.5;

  // mandalaConfigs.x -= mandalaConfigs.lineWidth;
  // mandalaConfigs.y -= mandalaConfigs.lineWidth;
  _shadowPass(ctx, mandalaConfigs);
  _highlightPass(ctx, mandalaConfigs);
}

function _shadowPass(ctx, mandalaConfigs) {
  ctx.save();
  ctx.translate(-mandalaConfigs.offset, -mandalaConfigs.offset);
  ctx.strokeStyle = mandalaConfigs.shadowColor;
  ctx.lineWidth = mandalaConfigs.lineWidth;
  ctx.fillStyle = mandalaConfigs.shadowColor;
  _drawMandalaPaths(ctx, mandalaConfigs);
  ctx.restore();
}

function _highlightPass(ctx, mandalaConfigs) {
  ctx.save();
  // ctx.translate(mandalaConfigs.offset, mandalaConfigs.offset);

  let lighterHighlight = adjustColor(mandalaConfigs.highlightColor, 75);
  const highlightStyle = createMetallicGradient(
    ctx,
    mandalaConfigs.centerX,
    mandalaConfigs.centerY,
    mandalaConfigs.spikeDistance + 10,
    mandalaConfigs.highlightColor,
    lighterHighlight
  );

  ctx.lineWidth = mandalaConfigs.lineWidth;
  ctx.strokeStyle = highlightStyle;
  ctx.fillStyle = highlightStyle;
  _drawMandalaPaths(ctx, mandalaConfigs);
  ctx.restore();
}

function _drawMandalaPaths(ctx, c) {
  for (let i = 0; i < c.numPoints; i++) {
    const angle = (i / c.numPoints) * 2 * Math.PI;
    const startX = c.centerX + c.innerRadius * Math.cos(angle);
    const startY = c.centerY + c.innerRadius * Math.sin(angle);
    const endX = c.centerX + c.spikeDistance * Math.cos(angle);
    const endY = c.centerY + c.spikeDistance * Math.sin(angle);
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const anglePerp = angle + Math.PI / 2;
    const cpX = midX + c.curveAmount * Math.cos(anglePerp);
    const cpY = midY + c.curveAmount * Math.sin(anglePerp);
    const cpX_inv = midX - c.curveAmount * Math.cos(anglePerp);
    const cpY_inv = midY - c.curveAmount * Math.sin(anglePerp);

    if (c.fillStyle === "lines" || c.fillStyle === "lines_with_spokes") {
      // Draw spoke.
      if (c.fillStyle === "lines_with_spokes") {
        ctx.beginPath();
        ctx.moveTo(c.centerX, c.centerY); // From the absolute center
        ctx.lineTo(endX, endY); // To the base of the leaf
        ctx.stroke();
      }

      ctx.beginPath();
      if (c.leafType === "right" || c.leafType === "both") {
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.stroke();
      }
      ctx.beginPath();
      if (c.leafType === "left" || c.leafType === "both") {
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX_inv, cpY_inv, endX, endY);
        ctx.stroke();
      }
    } else {
      if (c.leafType === "both") {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.quadraticCurveTo(cpX_inv, cpY_inv, startX, startY);
        ctx.fill();
      } else {
        if (c.leafType === "right") {
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.quadraticCurveTo(cpX, cpY, endX, endY);
          ctx.closePath();
          ctx.fill();
        }
        if (c.leafType === "left") {
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

/**
 * Creates a tileable Seigaiha wave pattern on an off-screen canvas.
 * @param {CanvasRenderingContext2D} ctx - The main canvas context to create the pattern for.
 * @param {string} color - The color of the pattern lines.
 * @returns {CanvasPattern} A reusable pattern object.
 */

// export function createBackgroundPattern(ctx, color) {
//   const patternCanvas = document.createElement('canvas');
//   const patternCtx = patternCanvas.getContext('2d');
// 
//   const size = 30; // The size of the largest square tile
//   patternCanvas.width = size;
//   patternCanvas.height = size;
// 
//   patternCtx.strokeStyle = color;
//   patternCtx.lineWidth = 1;
// 
//   // Draw a series of squares, each one smaller than the last.
//   // We use a loop that reduces the size of the square in each iteration.
//   for (let i = 0; i < 10; i++) {
//     const squareSize = size - (i * 5); // Each square is 5px smaller
//     const offset = (size - squareSize) / 2;
// 
//     patternCtx.strokeRect(offset, offset, squareSize, squareSize);
//   }
// 
//   return ctx.createPattern(patternCanvas, 'repeat');
// }

// VERY GOOD
export function createBackgroundPattern(ctx, color) {
  const patternCanvas = document.createElement('canvas');
  const patternCtx = patternCanvas.getContext('2d');

  const size = 20; // The size of the tile. A larger size helps prevent clipping after rotation.
  patternCanvas.width = size;
  patternCanvas.height = size;

  patternCtx.strokeStyle = color;
  patternCtx.lineWidth = 1;

  // --- NEW: Rotation Logic ---
  // 1. Move the origin to the center of the canvas tile.
  patternCtx.translate(size / 2, size / 2);
  // 2. Rotate the entire coordinate system by 45 degrees.
  patternCtx.rotate(Math.PI / 4);
  // 3. Move the origin back. This ensures the rotation happens around the center.
  patternCtx.translate(-size / 2, -size / 2);
  // --- End of New Logic ---

  // Draw a series of concentric squares, which will now appear rotated.
  for (let i = 0; i < 2; i++) {
    const squareSize = size - (i * 6); // Adjust spacing as needed
    const offset = (size - squareSize) / 2;

    patternCtx.strokeRect(offset, offset, squareSize, squareSize);
  }

  return ctx.createPattern(patternCanvas, 'repeat');
}
//
// export function createBackgroundPattern(ctx, color) {
//     const patternCanvas = document.createElement('canvas');
//     const patternCtx = patternCanvas.getContext('2d');
// 
//     const size = 20;
//     patternCanvas.width = size;
//     patternCanvas.height = size;
// 
//     patternCtx.strokeStyle = color;
//     patternCtx.lineWidth = 2;
//     patternCtx.lineCap = 'round'; // Makes the ends of the lines soft and round
// 
//     // Draw two short, diagonal lines in a staggered pattern.
//     patternCtx.beginPath();
//     patternCtx.moveTo(size * 0.25, size * 0.1);
//     patternCtx.lineTo(size * 0.25, size * 0.4);
//     patternCtx.stroke();
// 
//     patternCtx.beginPath();
//     patternCtx.moveTo(size * 0.75, size * 0.6);
//     patternCtx.lineTo(size * 0.75, size * 0.9);
//     patternCtx.stroke();
// 
//     return ctx.createPattern(patternCanvas, 'repeat');
// }
//

// export function createBackgroundPattern(ctx, color) {
//   const patternCanvas = document.createElement('canvas');
//   const patternCtx = patternCanvas.getContext('2d');
// 
//   const size = 40; // The size of one tile
//   patternCanvas.width = size;
//   patternCanvas.height = size;
// 
//   patternCtx.strokeStyle = color;
//   patternCtx.lineWidth = 1.5;
// 
//   // Draw two intersecting arcs. When tiled, they form a web of rings.
//   patternCtx.beginPath();
//   patternCtx.arc(0, size / 2, size / 2, -Math.PI / 3, Math.PI / 3);
//   patternCtx.stroke();
// 
//   patternCtx.beginPath();
//   patternCtx.arc(size, size / 2, size / 2, Math.PI * (2/3), Math.PI * (4/3));
//   patternCtx.stroke();
// 
//   return ctx.createPattern(patternCanvas, 'repeat');
// }
//
//
// export function createBackgroundPattern(ctx, color) {
//   const patternCanvas = document.createElement('canvas');
//   const patternCtx = patternCanvas.getContext('2d');
// 
//   const size = 20; // The size of one tile
//   patternCanvas.width = size;
//   patternCanvas.height = size;
// 
//   patternCtx.fillStyle = color;
// 
//   // Draw two small circles, one in the top-left and one in the bottom-right.
//   // When tiled, this creates a staggered (quincunx) dot pattern.
//   patternCtx.beginPath();
//   patternCtx.arc(size / 4, size / 4, size / 8, 0, 2 * Math.PI);
//   patternCtx.fill();
// 
//   patternCtx.beginPath();
//   patternCtx.arc(size * 0.75, size * 0.75, size / 8, 0, 2 * Math.PI);
//   patternCtx.fill();
// 
//   return ctx.createPattern(patternCanvas, 'repeat');
// }
//
// export function createBackgroundPattern(ctx, color) {
//   const patternCanvas = document.createElement('canvas');
//   const patternCtx = patternCanvas.getContext('2d');
// 
//   const size = 10; // The size of one tile
//   patternCanvas.width = size;
//   patternCanvas.height = size;
// 
//   patternCtx.strokeStyle = color;
//   patternCtx.lineWidth = 1.5;
// 
//   // Draw a single diagonal line across the tile.
//   // The 'repeat' will connect them seamlessly.
//   patternCtx.beginPath();
//   patternCtx.moveTo(0, size);
//   patternCtx.lineTo(size, 0);
//   patternCtx.stroke();
// 
//   return ctx.createPattern(patternCanvas, 'repeat');
// }
// 
// 
// export function createBackgroundPattern(ctx, color) {
//   const patternCanvas = document.createElement('canvas');
//   const patternCtx = patternCanvas.getContext('2d');
// 
//   const size = 20; // The size of one tile
//   patternCanvas.width = size;
//   patternCanvas.height = size;
// 
//   patternCtx.fillStyle = color;
//   // Draw a single circle in the corner. When this tile repeats,
//   // it will form a perfect grid.
//   patternCtx.beginPath();
//   patternCtx.arc(size / 2, size / 2, 1.5, 0, 2 * Math.PI); // A small dot
//   patternCtx.fill();
// 
//   return ctx.createPattern(patternCanvas, 'repeat');
// }
// export function createBackgroundPattern(ctx, color) {
//     const patternCanvas = document.createElement('canvas');
//     const patternCtx = patternCanvas.getContext('2d');
// 
//     const size = 20; // The base size for the hexagon tile
//     const hexHeight = size;
//     const hexWidth = (Math.sqrt(3) / 2) * hexHeight;
// 
//     patternCanvas.width = hexWidth;
//     patternCanvas.height = hexHeight;
// 
//     patternCtx.strokeStyle = color;
//     patternCtx.lineWidth = 1;
// 
//     // Draw one half of a hexagon. When tiled, it will connect
//     // with its neighbors to form the full honeycomb pattern.
//     patternCtx.beginPath();
//     patternCtx.moveTo(0, hexHeight * 0.25);
//     patternCtx.lineTo(hexWidth / 2, 0);
//     patternCtx.lineTo(hexWidth, hexHeight * 0.25);
//     patternCtx.moveTo(0, hexHeight * 0.75);
//     patternCtx.lineTo(hexWidth / 2, hexHeight);
//     patternCtx.lineTo(hexWidth, hexHeight * 0.75);
//     patternCtx.stroke();
// 
//     return ctx.createPattern(patternCanvas, 'repeat');
// }
//
// export function createBackgroundPattern(ctx, color) {
//   const patternCanvas = document.createElement('canvas');
//   const patternCtx = patternCanvas.getContext('2d');
// 
//   const size = 15; // The size of one tile
//   patternCanvas.width = size;
//   patternCanvas.height = size;
// 
//   patternCtx.strokeStyle = color;
//   patternCtx.lineWidth = 1;
// 
//   // Draw two crossing "V" shapes. When tiled, they create
//   // an intricate woven pattern.
//   patternCtx.beginPath();
//   patternCtx.moveTo(0, size * 0.5);
//   patternCtx.lineTo(size * 0.5, 0);
//   patternCtx.lineTo(size, size * 0.5);
//   patternCtx.stroke();
// 
//   patternCtx.beginPath();
//   patternCtx.moveTo(0, size * 0.5);
//   patternCtx.lineTo(size * 0.5, size);
//   patternCtx.lineTo(size, size * 0.5);
//   patternCtx.stroke();
// 
//   return ctx.createPattern(patternCanvas, 'repeat');
// }
// 
// export function createBackgroundPattern(ctx, color) {
//     const patternCanvas = document.createElement('canvas');
//     const patternCtx = patternCanvas.getContext('2d');
// 
//     const size = 20;
//     const height = size * Math.sqrt(3);
// 
//     patternCanvas.width = size;
//     patternCanvas.height = height;
// 
//     patternCtx.strokeStyle = color;
//     patternCtx.lineWidth = 1;
// 
//     // Draw the lines that form the star shape
//     patternCtx.beginPath();
//     // Center horizontal
//     patternCtx.moveTo(0, height / 2);
//     patternCtx.lineTo(size, height / 2);
//     // Top-left to bottom-right
//     patternCtx.moveTo(0, 0);
//     patternCtx.lineTo(size / 2, height / 2);
//     patternCtx.lineTo(0, height);
//     // Top-right to bottom-left
//     patternCtx.moveTo(size, 0);
//     patternCtx.lineTo(size / 2, height / 2);
//     patternCtx.lineTo(size, height);
//     patternCtx.stroke();
// 
//     return ctx.createPattern(patternCanvas, 'repeat');
// }
// export function createBackgroundPattern(ctx, color) {
//   const patternCanvas = document.createElement('canvas');
//   const patternCtx = patternCanvas.getContext('2d');
// 
//   const size = 5; // The size of each square tile
//   patternCanvas.width = size;
//   patternCanvas.height = size;
// 
//   patternCtx.strokeStyle = color;
//   patternCtx.lineWidth = 1;
// 
//   // Draw one horizontal and one vertical line.
//   // When this tile repeats, the lines will connect to form a grid.
//   patternCtx.beginPath();
//   patternCtx.moveTo(0, size);
//   patternCtx.lineTo(size, size); // Horizontal line at the bottom
//   patternCtx.moveTo(size, 0);
//   patternCtx.lineTo(size, size); // Vertical line on the right
//   patternCtx.stroke();
// 
//   return ctx.createPattern(patternCanvas, 'repeat');
// }
// 
