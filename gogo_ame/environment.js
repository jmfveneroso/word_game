import { Config } from "./config.js";
import { symbolDefinitions, L1_SYMBOLS, L1_NORMAL_SYMBOLS } from "./symbols.js";
import { spawnParticles, updateAndDrawParticles } from "./particles.js";
import { Ball } from "./ball.js";
import { canvasWidth, canvasHeight, canvas, ctx } from "./ui.js";
import { GameState } from "./game_state.js";
import { addPlayerEvents } from "./player.js";

function createBall() {
  if (GameState.gameOver) return;

  let randomSymbolId;

  // 1. Roll the dice (get a random number between 0 and 1).
  const roll = Math.random();

  if (roll < Config.lifeSymbolSpawnRate) {
    randomSymbolId = "S1_LIFE";
  } else if (roll < Config.lifeSymbolSpawnRate + Config.voidSymbolSpawnRate) {
    randomSymbolId = "S1_VOID";
  } else {
    // 3. Otherwise, pick a random symbol from the list of NORMAL L1 symbols.
    randomSymbolId =
      L1_NORMAL_SYMBOLS[Math.floor(Math.random() * L1_NORMAL_SYMBOLS.length)];
  }

  const symbolDef = symbolDefinitions[randomSymbolId];

  let actualRadius;
  if (randomSymbolId === "S1_VOID") {
    // Check if the variable size feature is enabled in the config.
    if (Config.enableVariableVoidSize) {
      // 1. Calculate a random multiplier within the min/max range.
      const randomMultiplier =
        Math.random() *
          (Config.voidSizeMultiplierMax - Config.voidSizeMultiplierMin) +
        Config.voidSizeMultiplierMin;

      // 2. Apply the random multiplier to the base radius.
      actualRadius = Config.baseBallRadius * randomMultiplier;
    } else {
      // 3. If disabled, use the original fixed multiplier as a fallback.
      actualRadius = Config.baseBallRadius * Config.voidBallRadiusMultiplier;
    }
  } else {
    // This logic for normal symbols remains unchanged.
    const sizeMultiplier = 1.0 + (symbolDef.level - 1) * Config.sizeIncreasePerLevel;
    actualRadius = Config.baseBallRadius * sizeMultiplier;
  }

  actualRadius = Math.max(5, actualRadius);

  const x = Math.random() * (canvasWidth - actualRadius * 2) + actualRadius;
  
  const y = -actualRadius - Math.random() * 20;
  const isBlack = Math.random() < Config.Initial_Ratio_Black_To_Gray;
  GameState.balls.push(new Ball(x, y, actualRadius, randomSymbolId, isBlack));
}

export function addBallSpawnsEvents() {
  if (Config.ballCreationInterval > 0) {
    GameState.ballCreationTimerId = setInterval(
      createBall,
      Config.ballCreationInterval
    );
  }
}

export function resetBallCreationTimer() {
  clearInterval(GameState.ballCreationTimerId);
  if (Config.ballCreationInterval > 0) {
    GameState.ballCreationTimerId = setInterval(
      createBall,
      Config.ballCreationInterval
    );
  }
}
