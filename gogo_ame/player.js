import { Config } from "./config.js";
import { canvas } from "./ui.js";
import { GameState } from "./game_state.js";

// --- Generic Input Handlers ---
// These functions contain the core logic and are called by both mouse and touch events.

/**
 * Starts the wind curve drawing process at a specific coordinate.
 * @param {number} x The starting x-coordinate.
 * @param {number} y The starting y-coordinate.
 */
function handleDragStart(x, y) {
  if (GameState.gameOver) return;

  GameState.isDrawingWind = true;

  // Initialize a new wind curve
  GameState.windCurve = {
    points: [{ x, y }],
    createdAt: Date.now(),
    particleSpawnAccumulator: 0,
  };
}

/**
 * Continues the wind curve drawing process at a new coordinate.
 * @param {number} x The new x-coordinate.
 * @param {number} y The new y-coordinate.
 */
function handleDragMove(x, y) {
  if (!GameState.isDrawingWind || !GameState.windCurve) return;

  const lastPoint =
    GameState.windCurve.points[GameState.windCurve.points.length - 1];
  const distance = Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2);

  // Only add a new point if the mouse/finger has moved a minimum distance
  if (distance > Config.minPointDistance) {
    GameState.windCurve.points.push({ x, y });
  }
}

/**
 * Ends the wind curve drawing process.
 */
function handleDragEnd() {
  if (GameState.windCurve) {
    let totalLength = 0;
    const points = GameState.windCurve.points;

    // Calculate the total length of the curve by summing its segments
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      totalLength += Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    }

    // Calculate the final lifetime based on the length
    const dynamicLifetime = totalLength * Config.windLifetimePerPixel;
    GameState.windCurve.lifetime = Config.windBaseLifetime + dynamicLifetime;
  }

  GameState.isDrawingWind = false;
}

export function addPlayerEvents() {}
// --- Main Exported Function ---

/**
 * Sets up all player input listeners for both mouse (desktop) and touch (mobile).
 */
export function addPlayerWindEvents() {
  // NOTE: We REMOVE `const rect = ...` from here.

  // --- Mouse Event Listeners ---
  canvas.addEventListener("mousedown", (event) => {
    // Get the fresh canvas position at the moment of the event
    const rect = canvas.getBoundingClientRect();
    handleDragStart(event.clientX - rect.left, event.clientY - rect.top);
  });

  document.addEventListener("mousemove", (event) => {
    if (GameState.isDrawingWind) {
      // Get the fresh canvas position at the moment of the event
      const rect = canvas.getBoundingClientRect();
      handleDragMove(event.clientX - rect.left, event.clientY - rect.top);
    }
  });

  document.addEventListener("mouseup", () => {
    if (GameState.isDrawingWind) {
      handleDragEnd();
    }
  });

  // --- Touch Event Listeners ---
  canvas.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      // Get the fresh canvas position at the moment of the event
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches[0];
      handleDragStart(touch.clientX - rect.left, touch.clientY - rect.top);
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchmove",
    (event) => {
      event.preventDefault();
      if (GameState.isDrawingWind) {
        // Get the fresh canvas position at the moment of the event
        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];
        handleDragMove(touch.clientX - rect.left, touch.clientY - rect.top);
      }
    },
    { passive: false }
  );

  // touchend and touchcancel do not need coordinates, so they are fine
  canvas.addEventListener("touchend", () => {
    if (GameState.isDrawingWind) {
      handleDragEnd();
    }
  });

  canvas.addEventListener("touchcancel", () => {
    if (GameState.isDrawingWind) {
      handleDragEnd();
    }
  });
}
