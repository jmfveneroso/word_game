import { GameState } from "./game_state.js";
import { Ball } from "./ball.js";
import { symbolDefinitions, L1_SYMBOLS } from "./symbols.js";
import { Config } from "./config.js";
import { spawnParticles, updateAndDrawParticles } from "./particles.js";

function getCombinedSymbolId(id1, id2) {
  for (const symbolId in symbolDefinitions) {
    const def = symbolDefinitions[symbolId];
    if (def.recipe) {
      if (
        (def.recipe[0] === id1 && def.recipe[1] === id2) ||
        (def.recipe[0] === id2 && def.recipe[1] === id1)
      ) {
        return symbolId;
      }
    }
  }
  return null;
}

export function processCollisions() {
  if (GameState.gameOver) return;
  GameState.ballsToRemoveThisFrame = [];
  GameState.ballsToAddNewThisFrame = [];
  for (let i = 0; i < GameState.balls.length; i++) {
    let ballA = GameState.balls[i];
    if (GameState.ballsToRemoveThisFrame.includes(ballA)) continue;
    for (let j = i + 1; j < GameState.balls.length; j++) {
      let ballB = GameState.balls[j];
      if (
        GameState.ballsToRemoveThisFrame.includes(ballB) ||
        GameState.ballsToRemoveThisFrame.includes(ballA)
      )
        continue;
      if (ballA.isGrabbed || ballB.isGrabbed) continue;
      const dx = ballA.x - ballB.x;
      const dy = ballA.y - ballB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ballA.radius + ballB.radius && distance > 0.1) {
        // Check if either ball is the destructive VOID symbol
        // Check if one ball is a VOID symbol and the other is not.
        if (
          (ballA.symbolId === "S1_VOID" && ballB.symbolId !== "S1_VOID") ||
          (ballB.symbolId === "S1_VOID" && ballA.symbolId !== "S1_VOID")
        ) {
          // Identify which ball is the non-void symbol to be destroyed.
          const targetBall = ballA.symbolId === "S1_VOID" ? ballB : ballA;

          // Mark only the other symbol for destruction.
          GameState.ballsToRemoveThisFrame.push(targetBall);

          const midX =
            (ballA.x * ballB.radius + ballB.x * ballA.radius) /
            (ballA.radius + ballB.radius);
          const midY =
            (ballA.y * ballB.radius + ballB.y * ballA.radius) /
            (ballA.radius + ballB.radius);

          // Give a small point reward for the destruction.
          GameState.score += symbolDefinitions["S1_VOID"].eliminationPoints;

          // Spawn destruction particles at the collision point.
          spawnParticles(
            Config.Debris_Particle_Count,
            midX,
            midY,
            Config.particleDebrisColor,
            Config.Debris_Particle_Speed,
            1,
            4
          );
          break; // Exit the inner loop since the target ball is being destroyed.
        }

        const midX =
          (ballA.x * ballB.radius + ballB.x * ballA.radius) /
          (ballA.radius + ballB.radius);
        const midY =
          (ballA.y * ballB.radius + ballB.y * ballA.radius) /
          (ballA.radius + ballB.radius);
        const symbolDefA = symbolDefinitions[ballA.symbolId];
        if (ballA.symbolId === ballB.symbolId) {
          GameState.ballsToRemoveThisFrame.push(ballA, ballB);
          spawnParticles(
            Config.Explosion_Particle_Count,
            midX,
            midY,
            Config.particleExplosionColor,
            Config.Explosion_Particle_Speed,
            2,
            6
          );
          GameState.score += symbolDefA.eliminationPoints;
          const actualExplosionRadius =
            symbolDefA.explosionRadiusUnits * Config.baseBallRadius;
          for (let k = 0; k < GameState.balls.length; k++) {
            const otherBall = GameState.balls[k];
            if (GameState.ballsToRemoveThisFrame.includes(otherBall)) continue;
            const distToOther = Math.sqrt(
              (otherBall.x - midX) ** 2 + (otherBall.y - midY) ** 2
            );
            if (distToOther < actualExplosionRadius + otherBall.radius) {
              if (symbolDefA.explosionEffectLevels.includes(otherBall.level)) {
                GameState.ballsToRemoveThisFrame.push(otherBall);
                spawnParticles(
                  Config.Debris_Particle_Count,
                  otherBall.x,
                  otherBall.y,
                  Config.particleDebrisColor,
                  Config.Debris_Particle_Speed,
                  1,
                  4
                );
              }
            }
          }
          break;
        } else {
          const combinedSymId = getCombinedSymbolId(
            ballA.symbolId,
            ballB.symbolId
          );
          if (combinedSymId) {
            GameState.ballsToRemoveThisFrame.push(ballA, ballB);
            const productDef = symbolDefinitions[combinedSymId];
            let newRadius = Config.baseBallRadius * productDef.sizeMultiplier;
            newRadius = Math.max(15, newRadius);
            const totalMassProxy = ballA.radius + ballB.radius;
            const newVx =
              (ballA.vx * ballA.radius + ballB.vx * ballB.radius) /
              totalMassProxy;
            const newVy =
              (ballA.vy * ballA.radius + ballB.vy * ballB.radius) /
              totalMassProxy;
            const newIsBlack = ballA.isBlack || ballB.isBlack;
            const newBall = new Ball(
              midX,
              midY,
              newRadius,
              combinedSymId,
              newIsBlack
            );

            if (newBall.level > GameState.highestLevelAchieved) {
              GameState.highestLevelAchieved = newBall.level;
            }

            newBall.vx = newVx;
            newBall.vy = newVy;
            GameState.ballsToAddNewThisFrame.push(newBall);
            spawnParticles(
              Config.Construction_Particle_Count,
              midX,
              midY,
              Config.particleConstructColor,
              Config.Construction_Particle_Speed,
              1,
              5,
              Config.PARTICLE_LIFETIME_MS * 0.8,
              false
            );
            break;
          } else {
            const overlap = ballA.radius + ballB.radius - distance;
            const pushFactor = 0.05;
            const pushX = (dx / distance) * overlap * pushFactor;
            const pushY = (dy / distance) * overlap * pushFactor;
            const totalRadius = ballA.radius + ballB.radius;
            if (totalRadius > 0) {
              ballA.vx += pushX * (ballB.radius / totalRadius);
              ballA.vy += pushY * (ballB.radius / totalRadius);
              ballB.vx -= pushX * (ballA.radius / totalRadius);
              ballB.vy -= pushY * (ballA.radius / totalRadius);
            }
          }
        }
      }
    }
  }

  if (GameState.ballsToRemoveThisFrame.length > 0) {
    GameState.balls = GameState.balls.filter(
      (b) => !GameState.ballsToRemoveThisFrame.includes(b)
    );
  }

  if (GameState.ballsToAddNewThisFrame.length > 0) {
    GameState.balls.push(...GameState.ballsToAddNewThisFrame);
  }
}
