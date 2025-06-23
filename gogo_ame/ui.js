import { Config } from "./config.js";
import { mandalaDefinitions } from "./symbols.js";
import { GameState } from "./game_state.js";
import { drawMandala } from "./drawing.js"; // Import the shared function
import { resetBallCreationTimer } from "./environment.js";

const controlsPanel = document.querySelector(".controls");
const highestLevelCanvas = document.getElementById("highestLevelCanvas");
const highestLevelCtx = highestLevelCanvas.getContext("2d");
export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");
export let canvasWidth = window.innerWidth;
export let canvasHeight = window.innerHeight;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const dpr = window.devicePixelRatio || 1;

const displayWidth = highestLevelCanvas.width;
const displayHeight = highestLevelCanvas.height;

highestLevelCanvas.width = displayWidth * dpr;
highestLevelCanvas.height = displayHeight * dpr;

highestLevelCanvas.style.width = `${displayWidth}px`;
highestLevelCanvas.style.height = `${displayHeight}px`;
highestLevelCtx.scale(dpr, dpr);

const rangeFactor = 10;

const configurableParams = [
  ["terminalVelocity", 0.1],
  ["baseBallRadius", 1],
  ["ballCreationInterval", 100],
  ["friction", 0.005],
  ["sidewaysWindStrength", 0.001],
  ["windInfluenceRadius", 5],
  ["windCouplingStrength", 0.001],
  ["windForceFalloff", 0.05],
  ["windBaseLifetime", 200],
  ["windLifetimePerPixel", 1],
  ["windStrength", 0.1],
  ["windMaxSpeed", 0.1],
  ["windOscillationAmplitude", 0.001],
  ["windOscillationFrequency1", 0.1],
  ["windOscillationFrequency2", 0.2],
  ["ballTrailLength", 50],
  ["ballTrailStartWidth", 1],
  ["ballTrailEndWidth", 1],
  ["ballTrailOpacity", 0.001],
  ["voidBallRadiusMultiplier", 0.1],
  ["enableBallTrails", "toggle"],
  ["enableWildcard", "toggle"],
  ["enableDegradation", "toggle"],
  ["enableHardDegradation", "toggle"],
  ["degradationKnockback", 1],
  ["degradationWindImmunityDuration", 100],
  ["voidSymbolSpawnRate", 0.05],
  ["voidSizeMultiplierMin", 0.05],
  ["voidSizeMultiplierMax", 0.05],
  ["voidSpeedMultiplier", 0.01],
  ["enableDangerHighlight", "toggle"],
  ["dangerHighlightMinLevel", 1],
  ["dangerHighlightBlur", 5],
  ["dangerHighlightMaxDistance", 10],
  ["enableLivesSystem", "toggle"],
  ["enableSimpleCombinationMode", "toggle"],
  ["initialLives", 1],
  ["lifeSymbolSpawnRate", 0.01],
  ["lifeSymbolFallSpeedMultiplier", 0.1],
  ["maxLives", 1],
  ["sizeIncreasePerLevel", 0.01],
  ["enableWindCombination", "toggle"],
  ["windCombinationChargeTime", 100],
  ["windArrivalDistance", 5],
  ["enableBallBorder", "toggle"],
  ["enableBallFill", "toggle"],
  ["invertColors", "toggle"],
  ["strokeColors", "toggle"],
  ["gravityMassEffect", 0.5],
];

function drawLeaf(x, y, color) {
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = color;

  // --- NEW: Dynamic Size Calculation ---
  // Define a base size for the leaf on a large screen.
  const baseLeafHeight = 30;
  // Create a scale factor based on the canvas width.
  // We'll use 800px as a reference width for full-size leaves.
  // The Math.min ensures the leaves don't get overly large on ultra-wide screens.
  const scaleFactor = Math.min(1.0, canvasWidth / 500);

  const leafHeight = baseLeafHeight * scaleFactor;
  // Maintain the leaf's aspect ratio by scaling its width proportionally.
  const leafHalfWidth = leafHeight / 2;
  // --- End of New Logic ---

  // Move the canvas origin to the leaf's position
  ctx.translate(x, y);
  // Rotate the entire canvas by 45 degrees
  ctx.rotate(Math.PI / 4);

  // Draw the leaf at the new (0,0) origin using the dynamic dimensions
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(leafHalfWidth, leafHalfWidth, 0, leafHeight);
  ctx.quadraticCurveTo(-leafHalfWidth, leafHalfWidth, 0, 0);
  ctx.fill();

  // ctx.strokeStyle = (Config.invertColors) ? Config.symbolColor.inverted : Config.symbolColor.normal;
  // ctx.stroke();

  ctx.restore();
}

/**
 * Draws the current number of lives as leaves in the top-right corner.
 */
export function drawLivesDisplay() {
  if (!Config.enableLivesSystem) return;

  for (let i = 0; i < Config.maxLives; i++) {
    // Position leaves from right to left
    const x = canvasWidth - 40 - i * 30;
    const y = 20;

    // Determine if the leaf should be green (alive) or black (lost)
    const isLifeRemaining = i < GameState.lives;
    const color = isLifeRemaining
      ? Config.invertColors
        ? Config.lifeLeafColor.inverted
        : Config.lifeLeafColor.normal
      : Config.invertColors
        ? Config.lostLifeLeafColor.inverted
        : Config.lostLifeLeafColor.normal;

    drawLeaf(x, y, color);
  }
}

export function drawHighestLevelDisplay() {
  // --- NEW: Use the intended display size for all calculations ---
  // We get this from the canvas's style, which we set during the high-DPI setup.
  const displayWidth = parseInt(highestLevelCanvas.style.width, 10);
  const displayHeight = parseInt(highestLevelCanvas.style.height, 10);

  highestLevelCtx.clearRect(
    0,
    0,
    highestLevelCanvas.width,
    highestLevelCanvas.height
  );

  let backgroundColor = "#000"; // Default background color is black

  const levelToDisplay = Math.min(
    GameState.highestLevelAchieved,
    Config.MAX_SYMBOL_LEVEL
  );

  const representativeId = `S${levelToDisplay}_SOLID_BOTH`;
  const mandalaDef = mandalaDefinitions[representativeId];

  if (mandalaDef && mandalaDef.mandalaConfig) {
    const config = mandalaDef.mandalaConfig;
    const displayColor = "#FFFFFF";
    const maxRadius = (displayWidth / 2) * 0.9;

    const finalSpikeDistance = config.spikeDistance * maxRadius;
    let currentSpikeDistance = finalSpikeDistance;

    if (GameState.isAnimatingHighestLevel) {
      const elapsedTime = Date.now() - GameState.highestLevelAnimationStart;
      const animationProgress = Math.min(
        1.0,
        elapsedTime / Config.highestLevelAnimationDuration
      );

      // --- NEW TWO-STAGE ANIMATION LOGIC ---

      // Stage 1: The mandala grows quickly during the first half of the animation.
      const growProgress = Math.min(1.0, animationProgress / 0.5);
      currentSpikeDistance = finalSpikeDistance * growProgress;

      // The background is solid gold during the grow stage.
      backgroundColor = "#D4AF37"; // A nice gold color

      // Stage 2: The background fades from gold to black during the second half.
      if (animationProgress > 0.5) {
        // This value goes from 0.0 to 1.0 during the second half of the animation
        const fadeProgress = (animationProgress - 0.5) / 0.5;

        // The RGB values for gold
        const gold = { r: 212, g: 175, b: 55 };

        // Interpolate each color channel from gold towards black (0)
        const r = gold.r * (1 - fadeProgress);
        const g = gold.g * (1 - fadeProgress);
        const b = gold.b * (1 - fadeProgress);

        backgroundColor = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
      }

      // If the entire animation is complete, turn it off
      if (animationProgress >= 1.0) {
        GameState.isAnimatingHighestLevel = false;
        backgroundColor = "#000"; // Ensure it ends on black
      }
    }

    // Fill the background with the calculated color
    highestLevelCtx.fillStyle = backgroundColor;
    highestLevelCtx.fillRect(
      0,
      0,
      highestLevelCanvas.width,
      highestLevelCanvas.height
    );

    drawMandala(
      highestLevelCtx,
      // Center the drawing in the logical 80x80 space
      displayWidth / 2,
      displayHeight / 2,
      config.innerRadius * maxRadius,
      config.numPoints,
      currentSpikeDistance,
      config.leafType,
      displayColor,
      config.curveAmount * maxRadius,
      "lines"
    );
  }

  const highestScoreEl = document.getElementById("scoreDisplay");
  if (highestScoreEl) {
    highestScoreEl.style.color = Config.invertColors
      ? Config.scorePopupColor.inverted
      : Config.scorePopupColor.normal;
    if (GameState.isAnimatingHighestScore) {
      const elapsed = Date.now() - GameState.isAnimatingHighestScoreStart;
      const progress = elapsed / Config.highestScoreAnimationDuration;

      // Create a "pulse" effect by scaling up and then back down using a sine wave
      const pulse = Math.sin(progress * Math.PI);
      const scale = 1 + pulse * 0.5; // Scale up to 1.5x size at the animation's midpoint

      highestScoreEl.style.transform = `scale(${scale})`;

      if (progress >= 1.0) {
        GameState.isAnimatingHighestScore = false;
        // Reset styles when animation is done
        highestScoreEl.style.transform = "scale(1)";
      }
    } else {
      // Ensure styles are reset if not animating
      highestScoreEl.style.transform = "scale(1)";
    }
  }
}

export function updateScoreDisplay() {
  const scoreEl = document.getElementById("score-display");
  if (scoreEl) {
    scoreEl.textContent = `${GameState.score}`;
  }
}

function resizeCanvas() {
  // CHANGE these two lines
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight; // The canvas should always fill the window

  // This logic is incorrect for an overlay panel and should be removed:
  // canvasHeight = window.innerHeight - controlsPanel.offsetHeight - 10;

  if (canvasHeight < 50) canvasHeight = 50; // This check can be removed or kept as a safeguard
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

export function clearCanvas() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

/**
 * Generic handler for any slider change.
 * Updates the Config object and the value display span.
 * @param {Event} event
 */
function handleSliderChange(event) {
  const slider = event.target;
  const paramName = slider.id;
  const value = parseFloat(slider.value);
  const decimals = parseInt(slider.dataset.decimals, 10);

  // Update the global Config object
  Config[paramName] = value;

  // Update the corresponding value display
  const valueSpan = document.getElementById(`${paramName}Value`);
  if (valueSpan) {
    valueSpan.textContent = value.toFixed(decimals);
  }
}

function handleCheckboxChange(event) {
  const checkbox = event.target;
  Config[checkbox.id] = checkbox.checked;
}

function handleIntervalChange(event) {
  const slider = event.target;
  const value = parseInt(slider.value, 10);

  // 1. Update the Config object
  Config.ballCreationInterval = value;

  // 2. Update the display span
  const valueSpan = document.getElementById(`${slider.id}Value`);
  if (valueSpan) {
    valueSpan.textContent = value;
  }

  // 3. Call the function to reset the actual game timer
  resetBallCreationTimer();
}

function camelCaseToTitleCase(text) {
  // Insert a space before any uppercase letter
  const withSpaces = text.replace(/([A-Z])/g, " $1");
  // Capitalize the first letter and return
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

/**
 * Generates all UI slider controls programmatically based on the configurableParams array.
 */
function generateUiControls() {
  controlsPanel.innerHTML = ""; // Clear any existing controls

  configurableParams.forEach(([name, step]) => {
    const initialValue = Config[name];

    // Create the container div
    const group = document.createElement("div");

    // Create the label
    const label = document.createElement("label");
    label.setAttribute("for", name);
    label.textContent = camelCaseToTitleCase(name) + ":";
    group.appendChild(label);

    if (step === "toggle") {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = name;
      checkbox.checked = Config[name];
      checkbox.addEventListener("change", handleCheckboxChange);
      group.appendChild(checkbox);
    } else {
      // Create the range slider input
      const slider = document.createElement("input");
      slider.type = "range";
      slider.id = name;
      slider.value = initialValue;
      slider.step = step;

      const initialValueString = initialValue.toString();
      let decimals = initialValueString.includes(".")
        ? initialValueString.split(".")[1].length
        : 0;
      const stepValueString = step.toString();
      const stepDecimals = stepValueString.includes(".")
        ? stepValueString.split(".")[1].length
        : 0;
      slider.dataset.decimals = Math.max(decimals, stepDecimals);

      // Calculate min/max range around the initial value
      const range = rangeFactor * step;
      slider.min = Math.max(0, initialValue - range);
      slider.max = initialValue + range;

      if (name === "ballCreationInterval") {
        slider.addEventListener("input", handleIntervalChange);
      } else {
        slider.addEventListener("input", handleSliderChange);
      }
      group.appendChild(slider);

      // Create the value display span
      const valueSpan = document.createElement("span");
      valueSpan.id = `${name}Value`;
      valueSpan.textContent = initialValue.toFixed(decimals);
      group.appendChild(valueSpan);
    }

    // Add the completed group to the controls panel
    controlsPanel.appendChild(group);
  });
}

export function addUiEvents() {
  generateUiControls();
  resizeCanvas();

  // Get references to the buttons AFTER they have been created
  const expandBtn = document.getElementById("expand-controls-btn");

  // Add events to toggle the panel's visibility
  expandBtn.addEventListener("click", () => {
    controlsPanel.classList.toggle("hidden");
  });

  window.addEventListener("resize", resizeCanvas);
}
