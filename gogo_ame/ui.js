import { Config } from "./config.js";
import { mandalaDefinitions } from "./symbols.js";
import { GameState } from "./game_state.js";
import { drawMandala } from "./drawing.js"; // Import the shared function

// Get the new canvas element and its context
const highestLevelCanvas = document.getElementById("highestLevelCanvas");
const highestLevelCtx = highestLevelCanvas.getContext("2d");

export function drawHighestLevelDisplay() {
  highestLevelCtx.clearRect(
    0,
    0,
    highestLevelCanvas.width,
    highestLevelCanvas.height
  );

  highestLevelCtx.fillStyle = '#f43456';
  highestLevelCtx.fillRect(0, 0, highestLevelCanvas.width, highestLevelCanvas.height);

  const levelToDisplay = Math.min(
    GameState.highestLevelAchieved,
    Config.MAX_SYMBOL_LEVEL
  );

  const representativeId = `S${levelToDisplay}_SOLID_BOTH`;
  const mandalaDef = mandalaDefinitions[representativeId];
  console.log(representativeId);

  if (mandalaDef && mandalaDef.mandalaConfig) {
    const config = mandalaDef.mandalaConfig;
    const displayColor = "#FFFFFF";
    const maxRadius = (highestLevelCanvas.width / 2) * 0.9;

    drawMandala(
      highestLevelCtx,
      highestLevelCanvas.width / 2,
      highestLevelCanvas.height / 2,
      config.innerRadius * maxRadius,
      config.numPoints,
      config.spikeDistance * maxRadius,
      config.leafType,
      displayColor,
      config.curveAmount * maxRadius,
      "lines"
    );
  }
}

export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");
export const controlsDiv = document.querySelector(".controls");

export let canvasWidth = window.innerWidth;
export let canvasHeight = window.innerHeight - controlsDiv.offsetHeight - 10;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

function resizeCanvas() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight - controlsDiv.offsetHeight - 10;
  if (canvasHeight < 50) canvasHeight = 50;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

export function clearCanvas() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

export function addUiEvents() {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Slider Update Handlers
  // document.getElementById("gravitySlider").oninput = function () {
  //   Config.gravity = parseFloat(this.value);
  //   document.getElementById("gravityValue").textContent = parseFloat(
  //     this.value
  //   ).toFixed(3);
  // };
  document.getElementById("terminalVelSlider").oninput = function () {
    Config.terminalVelocity = parseFloat(this.value);
    document.getElementById("terminalVelValue").textContent = parseFloat(
      this.value
    ).toFixed(1);
  };
  document.getElementById("throwMultiplierSlider").oninput = function () {
    Config.throwMultiplier = parseFloat(this.value);
    document.getElementById("throwMultiplierValue").textContent = parseFloat(
      this.value
    ).toFixed(2);
  };
  document.getElementById("baseBallRadiusSlider").oninput = function () {
    Config.baseBallRadius = parseInt(this.value);
    document.getElementById("baseBallRadiusValue").textContent = this.value;
  };
  document.getElementById("creationIntervalSlider").oninput = function () {
    Config.ballCreationInterval = parseInt(this.value);
    document.getElementById("creationIntervalValue").textContent = this.value;
    clearInterval(ballCreationTimerId);
    if (ballCreationInterval > 0)
      ballCreationTimerId = setInterval(createBall, ballCreationInterval);
  };
  document.getElementById("frictionSlider").oninput = function () {
    Config.friction = parseFloat(this.value);
    document.getElementById("frictionValue").textContent = parseFloat(
      this.value
    ).toFixed(3);
  };
  document.getElementById("slingshotPowerSlider").oninput = function () {
    Config.slingshotPowerMultiplier = parseFloat(this.value);
    document.getElementById("slingshotPowerValue").textContent = parseFloat(
      this.value
    ).toFixed(2);
  };
  document.getElementById("windCouplingSlider").oninput = function () {
    Config.windCouplingStrength = parseFloat(this.value);
    document.getElementById("windCouplingValue").textContent = parseFloat(
      this.value
    ).toFixed(3);
  };
  document.getElementById("windInfluenceSlider").oninput = function () {
    Config.windInfluenceRadius = parseFloat(this.value);
    document.getElementById("windInfluenceValue").textContent = parseFloat(
      this.value
    ).toFixed(3);
  };

  // Initial setup
  // document.getElementById("gravityValue").textContent = parseFloat(
  //   Config.gravity
  // ).toFixed(3);
  document.getElementById("terminalVelValue").textContent = parseFloat(
    Config.terminalVelocity
  ).toFixed(1);
  document.getElementById("throwMultiplierValue").textContent = parseFloat(
    Config.throwMultiplier
  ).toFixed(2);
  document.getElementById("baseBallRadiusValue").textContent =
    Config.baseBallRadius;
  document.getElementById("creationIntervalValue").textContent =
    Config.ballCreationInterval;
  document.getElementById("frictionValue").textContent = Config.friction;
  document.getElementById("slingshotPowerValue").textContent =
    Config.slingshotPowerMultiplier;
  document.getElementById("windCouplingValue").textContent = parseFloat(
    Config.windCouplingStrength
  ).toFixed(3);
  document.getElementById("windInfluenceValue").textContent = parseFloat(
    Config.windInfluenceRadius
  ).toFixed(3);
}
