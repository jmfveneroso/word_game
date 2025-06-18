import { Config } from './config.js'; 

export const GameState = {
  particles: [],
  gameOver: false,
  lives: Config.Initial_Lives,
  score: 0,
  balls: [],
  ballCreationTimerId: 0,
  grabbedBall: null,
  lastMouseX: 0,
  lastMouseY: 0,
  ballsToRemoveThisFrame: [],
  ballsToAddNewThisFrame: [],
  animationFrameId: 0,
  isDrawingWind: false,
  windCurve: null, // Will hold { points: [], createdAt: 0 }
  animationFrameId: 0,
  totalElapsedTime: 0,
  highestLevelAchieved: 1,
};

function triggerGameOver() {
  if (GameState.gameOver) return;
  console.log("Game Over! Final Score:", score);
  GameState.gameOver = true;
  if (ballCreationTimerId) clearInterval(ballCreationTimerId);
  ballCreationTimerId = null;
  document.getElementById("finalScore").textContent = score;
  document.getElementById("gameOverScreen").style.display = "block";
}

export function handleLifeLoss(ball) {
  if (GameState.gameOver) return;
  GameState.lives--;
  updateUI();
  if (GameState.lives <= 0) {
    // triggerGameOver();
  }
}

export function updateUI() {
  // document.getElementById("score").textContent = GameState.score;
  // document.getElementById("lives").textContent = GameState.lives;
}

function resetGame() {
  console.log("Resetting game...");
  GameState.score = 0;
  GameState.lives = Config.Initial_Lives;
  GameState.balls = [];
  GameState.particles = [];
  GameState.grabbedBall = null;
  GameState.gameOver = false;
  GameState.highestLevelAchieved = 3;

  updateUI();
  document.getElementById("gameOverScreen").style.display = "none";
  if (Phyisics.ballCreationInterval > 0) {
    if (ballCreationTimerId) clearInterval(ballCreationTimerId);
    ballCreationTimerId = setInterval(createBall, Phyisics.ballCreationInterval);
  }
  lastFrameTime = performance.now();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(gameLoop);
}
document.getElementById("restartButton").addEventListener("click", resetGame);
