import { Config } from './config.js'; 
import { GameState } from './game_state.js'; 

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
  document.getElementById("gravitySlider").oninput = function () {
    Config.gravity = parseFloat(this.value);
    document.getElementById("gravityValue").textContent = parseFloat(
      this.value
    ).toFixed(3);
  };
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
  
  // Initial setup
  document.getElementById("gravityValue").textContent =
    parseFloat(Config.gravity).toFixed(3);
  document.getElementById("terminalVelValue").textContent =
    parseFloat(Config.terminalVelocity).toFixed(1);
  document.getElementById("throwMultiplierValue").textContent =
    parseFloat(Config.throwMultiplier).toFixed(2);
  document.getElementById("baseBallRadiusValue").textContent = Config.baseBallRadius;
  document.getElementById("creationIntervalValue").textContent =
    Config.ballCreationInterval;
  document.getElementById("frictionValue").textContent =
    Config.friction;
  document.getElementById("slingshotPowerValue").textContent =
    Config.slingshotPowerMultiplier;
}
