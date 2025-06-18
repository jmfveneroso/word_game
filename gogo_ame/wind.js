import { GameState } from "./game_state.js";
import { Config } from "./Config.js";
import { canvasWidth, canvasHeight, ctx } from "./ui.js";

export function drawWindCurve() {
  if (!GameState.windCurve || GameState.windCurve.points.length < 2) return;

  const now = Date.now();
  const age = now - GameState.windCurve.createdAt;

  if (age > Config.windCurveLifetime) {
    GameState.windCurve = null;
    return;
  }

  const points = GameState.windCurve.points;

  // Calculate a dynamic opacity so the entire stroke fades out over its lifetime
  const opacity = 1.0 - age / Config.windCurveLifetime;

  // --- New Tapering Stroke Logic ---

  const topEdgePoints = [];
  const bottomEdgePoints = [];

  // 1. Calculate the top and bottom edge points for the variable-width stroke
  for (let i = 0; i < points.length; i++) {
    const progress = i / (points.length - 1);
    const currentWidth =
      Config.windMaxWidth -
      (Config.windMaxWidth - Config.windMinWidth) * progress;

    let tangentX, tangentY;

    // For points in the middle, calculate a smoother tangent using the previous and next points
    if (i > 0 && i < points.length - 1) {
      tangentX = points[i + 1].x - points[i - 1].x;
      tangentY = points[i + 1].y - points[i - 1].y;
    } else if (i === 0) {
      // First point
      tangentX = points[i + 1].x - points[i].x;
      tangentY = points[i + 1].y - points[i].y;
    } else {
      // Last point
      tangentX = points[i].x - points[i - 1].x;
      tangentY = points[i].y - points[i - 1].y;
    }

    // Normalize the tangent vector
    const mag = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
    if (mag > 0) {
      tangentX /= mag;
      tangentY /= mag;
    }

    // Calculate the normal vector (perpendicular to the tangent)
    const normalX = -tangentY;
    const normalY = tangentX;

    // Calculate the two edge points by moving from the center point along the normal
    topEdgePoints.push({
      x: points[i].x + (normalX * currentWidth) / 2,
      y: points[i].y + (normalY * currentWidth) / 2,
    });
    bottomEdgePoints.push({
      x: points[i].x - (normalX * currentWidth) / 2,
      y: points[i].y - (normalY * currentWidth) / 2,
    });
  }

  // 2. Draw the shape by connecting the edge points and filling it
  ctx.beginPath();
  ctx.moveTo(topEdgePoints[0].x, topEdgePoints[0].y);

  for (let i = 1; i < topEdgePoints.length; i++) {
    ctx.lineTo(topEdgePoints[i].x, topEdgePoints[i].y);
  }

  // Draw the end cap and connect to the bottom edge, going backwards
  ctx.lineTo(
    bottomEdgePoints[bottomEdgePoints.length - 1].x,
    bottomEdgePoints[bottomEdgePoints.length - 1].y
  );

  for (let i = bottomEdgePoints.length - 2; i >= 0; i--) {
    ctx.lineTo(bottomEdgePoints[i].x, bottomEdgePoints[i].y);
  }

  ctx.closePath();

  // Set the fill style with the calculated fade-out opacity
  ctx.fillStyle = Config.windFillColor.replace(
    /[^,]+(?=\))/,
    opacity.toFixed(2)
  );
  ctx.fill();
}

// export function drawWindCurve() {
//   if (!GameState.windCurve || GameState.windCurve.points.length < 1) return;
// 
//   const now = Date.now();
//   const age = now - GameState.windCurve.createdAt;
// 
//   if (age > Config.windCurveLifetime) {
//     GameState.windCurve = null;
//     return;
//   }
// 
//   const points = GameState.windCurve.points;
// 
//   // Calculate a dynamic opacity so the entire stroke fades out over its lifetime
//   const opacity = 1.0 - (age / Config.windCurveLifetime);
// 
//   // --- New Circle-Based Stroke Logic ---
//   // This method draws a series of circles along the path, with their radius
//   // shrinking over time. This creates a smooth, tapered, "paintbrush" look.
// 
//   ctx.fillStyle = Config.windFillColor.replace(/[^,]+(?=\))/, opacity.toFixed(2));
// 
//   for (let i = 0; i < points.length; i++) {
//     const point = points[i];
// 
//     // Calculate how far along the stroke we are (from 0.0 to 1.0)
//     const progress = i / (points.length - 1);
// 
//     // Calculate the radius for the circle at this point, tapering from max to min width
//     const currentRadius = (Config.windMaxWidth - (Config.windMaxWidth - Config.windMinWidth) * progress) / 2;
// 
//     // Draw a single filled circle. The series of overlapping circles will form the stroke.
//     ctx.beginPath();
//     ctx.arc(point.x, point.y, Math.max(0, currentRadius), 0, 2 * Math.PI);
//     ctx.fill();
//   }
// }
