import { Config } from './config.js'; 
import { symbolDefinitions, L1_SYMBOLS } from './symbols.js'; 
import { spawnParticles, updateAndDrawParticles } from './particles.js'; 
import { Ball } from './ball.js'; 
import { processCollisions } from './physics.js'; 
import { addUiEvents, clearCanvas } from './ui.js'; 
import { GameState, updateUI } from './game_state.js'; 
import { addPlayerEvents } from './player.js';
import { addBallSpawnsEvents } from './environment.js';

let lastFrameTime = performance.now();
function updateBalls() {
  for (let i = GameState.balls.length - 1; i >= 0; i--) {
    const ball = GameState.balls[i];
    if (!ball.update(Config)) {
      GameState.balls.splice(i, 1);
    }
  }
}

function drawBalls() {
  for (const ball of GameState.balls) {
    ball.draw();
  }
}

function draw(deltaTime) {
  clearCanvas();
  updateAndDrawParticles(deltaTime);
  drawBalls();
}

// Initialize.
addPlayerEvents();
addBallSpawnsEvents();
addUiEvents();

function gameLoop(currentTime) {
  const deltaTime = currentTime - lastFrameTime;
  lastFrameTime = currentTime;

  if (GameState.gameOver) {
    draw(deltaTime);
    return;
  }

  processCollisions();
  updateBalls();

  draw(deltaTime);
  updateUI();

  GameState.animationFrameId = requestAnimationFrame(gameLoop);
}

GameState.animationFrameId = requestAnimationFrame(gameLoop);
