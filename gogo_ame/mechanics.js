import { Config } from "./config.js";
import { GameState, handleLifeLoss } from "./game_state.js";
import { symbolDefinitions } from "./symbols.js";
import { Ball } from "./ball.js";
import { spawnParticles } from "./particles.js";

/**
 * Handles the degradation of a ball upon collision.
 * If the ball has ingredients, it degrades into one of them with a knockback.
 * Otherwise, it is simply destroyed.
 * @param {Ball} ballToDegrade - The ball instance to be degraded.
 * @param {object} knockbackSource - An object with {x, y} to apply knockback force FROM.
 */
export function degradeBall(ballToDegrade, knockbackSource) {
  const targetDef = symbolDefinitions[ballToDegrade.symbolId];

  // Check if the symbol can be degraded (i.e., it has a recipe)
  if (targetDef && targetDef.recipe && targetDef.recipe.length > 0) {
    // It can be degraded!
    const degradedSymbolId =
      targetDef.recipe[Math.floor(Math.random() * targetDef.recipe.length)];
    const degradedDef = symbolDefinitions[degradedSymbolId];

    const newRadius = Config.baseBallRadius * degradedDef.sizeMultiplier;

    const newBall = new Ball(
      ballToDegrade.x,
      ballToDegrade.y,
      newRadius,
      degradedSymbolId,
      ballToDegrade.isBlack
    );

    // --- KNOCKBACK LOGIC ---
    const dx = ballToDegrade.x - knockbackSource.x;
    const dy = ballToDegrade.y - knockbackSource.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      newBall.vx = (dx / distance) * Config.degradationKnockback;
      newBall.vy = (dy / distance) * Config.degradationKnockback;
    } else {
      newBall.vy = -Config.degradationKnockback; // Fallback
    }

    GameState.ballsToAddNewThisFrame.push(newBall);
    spawnParticles(
      Config.Construction_Particle_Count,
      ballToDegrade.x,
      ballToDegrade.y,
      Config.invertColors ? Config.particleConstructColor.inverted : Config.particleConstructColor.normal,
      Config.Construction_Particle_Speed,
      1,
      4
    );
    GameState.ballsToRemoveThisFrame.push(ballToDegrade);
    return true;
  }

  // If it can't be degraded (e.g., a Level 1 symbol), just spawn debris.
  spawnParticles(
    Config.Debris_Particle_Count,
    ballToDegrade.x,
    ballToDegrade.y,
    Config.invertColors ? Config.particleDebrisColor.inverted : Config.particleDebrisColor.normal,
    Config.Debris_Particle_Speed,
    1,
    4
  );
  GameState.ballsToRemoveThisFrame.push(ballToDegrade);
  return false;
}
