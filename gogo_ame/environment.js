import { Config } from './config.js'; 
import { symbolDefinitions, L1_SYMBOLS } from './symbols.js'; 
import { spawnParticles, updateAndDrawParticles } from './particles.js'; 
import { Ball } from './ball.js'; 
import { canvasWidth, canvasHeight, canvas, ctx, controlsDiv } from './ui.js'; 
import { GameState, updateUI } from './game_state.js'; 
import { addPlayerEvents } from './player.js';

function createBall() {
  if (GameState.gameOver) return;
  const randomL1SymbolId =
    L1_SYMBOLS[Math.floor(Math.random() * L1_SYMBOLS.length)];
  const symbolDef = symbolDefinitions[randomL1SymbolId];
  let actualRadius = Config.baseBallRadius * symbolDef.sizeMultiplier;
  actualRadius = Math.max(15, actualRadius);
  const x = Math.random() * (canvasWidth - actualRadius * 2) + actualRadius;
  const y = -actualRadius - Math.random() * 20;
  const isBlack = Math.random() < Config.Initial_Ratio_Black_To_Gray;
  GameState.balls.push(new Ball(x, y, actualRadius, randomL1SymbolId, isBlack));
}

export function addBallSpawnsEvents() {
  if (Config.ballCreationInterval > 0) {
    GameState.ballCreationTimerId = setInterval(createBall, Config.ballCreationInterval);
  }
}
