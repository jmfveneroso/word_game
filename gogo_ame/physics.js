import { GameState, handleLifeLoss } from "./game_state.js";
import { Ball } from "./ball.js";
import { symbolDefinitions, L1_SYMBOLS } from "./symbols.js";
import { Config } from "./config.js";
import { spawnParticles, spawnHighestLevelParticles } from "./particles.js";
import { degradeBall } from "./mechanics.js";

function getLevel(inputString) {
  const match = inputString.match(/^S(\d+)_/);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  return null;
}

function getLineType(inputString) {
  return inputString.slice(2);
}

export function getCombinedSymbolId(id1, id2) {
  if (Config.enableWindCombination) {
    return null;
  }

  const level1 = getLevel(id1);
  const level2 = getLevel(id2);
  if (level1 !== level2) return null;

  if (id1 === id2) {
    if (Config.enableWildcard) {
      const level = getLevel(id1);
      return `S${level}_WILDCARD`;
    } else if (Config.enableSimpleCombinationMode) {
      const level = getLevel(id1);
      const lineType = getLineType(id2);
      return `S${level + 1}${lineType}`;
    }
  } 

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

  const def1 = symbolDefinitions[id1];
  const def2 = symbolDefinitions[id2];

  if (def1.isWildcard && def2.isWildcard) {
    return null;
  } else if (def1.isWildcard) {
    const level = getLevel(id2);
    const lineType = getLineType(id2);
    return `S${level + 1}${lineType}`;
  } else if (def2.isWildcard) {
    const level = getLevel(id1);
    const lineType = getLineType(id1);
    return `S${level + 1}${lineType}`;
  }

  return null;
}

function combineSymbols(ballA, ballB) {
  const dx = ballA.x - ballB.x;
  const dy = ballA.y - ballB.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const midX =
    (ballA.x * ballB.radius + ballB.x * ballA.radius) /
    (ballA.radius + ballB.radius);
  const midY =
    (ballA.y * ballB.radius + ballB.y * ballA.radius) /
    (ballA.radius + ballB.radius);
  const symbolDefA = symbolDefinitions[ballA.symbolId];

  const combinedSymId = getCombinedSymbolId(ballA.symbolId, ballB.symbolId);

  if (combinedSymId) {
    GameState.ballsToRemoveThisFrame.push(ballA, ballB);
    const productDef = symbolDefinitions[combinedSymId];

    const sizeMultiplier = 1.0 + (productDef.level - 1) * Config.sizeIncreasePerLevel;
    let newRadius = Config.baseBallRadius * sizeMultiplier;
    newRadius = Math.max(5, newRadius); // Use 5 to match environment.js

    const totalMassProxy = ballA.radius + ballB.radius;
    const newVx =
      (ballA.vx * ballA.radius + ballB.vx * ballB.radius) / totalMassProxy;
    const newVy =
      (ballA.vy * ballA.radius + ballB.vy * ballB.radius) / totalMassProxy;
    const newIsBlack = ballA.isBlack || ballB.isBlack;
    const newBall = new Ball(midX, midY, newRadius, combinedSymId, newIsBlack);

    if (newBall.level > 2) {
      const pointsGained = Math.pow(newBall.level, 2);
      GameState.score += pointsGained;
      GameState.isAnimatingHighestScore = true;
      GameState.isAnimatingHighestScoreStart = Date.now();

      GameState.particles.push({
          type: 'scorePopup',
          x: midX,
          y: midY - 20,
          text: `+${pointsGained}`,
          life: Config.scorePopupLifetime,
          totalLife: Config.scorePopupLifetime,
          vy: Config.scorePopupUpwardSpeed, // Negative Y is up
      });

      const scoreEl = document.getElementById("scoreDisplay");
      if (scoreEl) {
          const rect = scoreEl.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          GameState.particles.push({
              type: 'scorePopup',
              x: centerX,
              y: centerY + 20,
              text: `+${pointsGained}`,
              life: Config.scorePopupLifetime,
              totalLife: Config.scorePopupLifetime,
              vy: Config.scorePopupUpwardSpeed, // Negative Y is up
          });
      }
    }

    if (newBall.level > GameState.highestLevelAchieved) {
      GameState.highestLevelAchieved = newBall.level;
      GameState.isAnimatingHighestLevel = true;
      GameState.highestLevelAnimationStart = Date.now();

      const uiPanel = document.getElementById("highestLevelCanvas");
      if (uiPanel) {
        const rect = uiPanel.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        spawnHighestLevelParticles(centerX, centerY);
      }
    }

    newBall.vx = newVx;
    newBall.vy = newVy;
    GameState.ballsToAddNewThisFrame.push(newBall);
    spawnParticles(
      Config.Construction_Particle_Count,
      midX,
      midY,
      Config.invertColors ? Config.particleConstructColor.inverted : Config.particleConstructColor.normal,
      Config.Construction_Particle_Speed,
      1,
      5,
      Config.PARTICLE_LIFETIME_MS * 0.8,
      false
    );
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

function createExplosion(symbolDefA, midX, midY) {
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
          Config.invertColors ? Config.particleDebrisColor.inverted : Config.particleDebrisColor.normal,
          Config.Debris_Particle_Speed,
          1,
          4
        );
      }
    }
  }
}

export function processVoid(ballA, ballB) {
  const voidBall = ballA.symbolId === "S1_VOID" ? ballA : ballB;
  const targetBall = ballA.symbolId === "S1_VOID" ? ballB : ballA;

  const targetDef = symbolDefinitions[targetBall.symbolId];

  // Check if degradation is enabled AND if the target symbol has a valid recipe.
  if (
    Config.enableDegradation &&
    targetDef &&
    targetDef.recipe &&
    targetDef.recipe.length > 0
  ) {
    // It can be degraded!
    // 1. Randomly pick one of the two ingredients from the recipe.
    const degradedSymbolId =
      targetDef.recipe[Math.floor(Math.random() * targetDef.recipe.length)];
    const degradedDef = symbolDefinitions[degradedSymbolId];

    // 2. Calculate properties for the new, degraded ball.
    const newRadius = Config.baseBallRadius * degradedDef.sizeMultiplier;
    const newIsBlack = targetBall.isBlack; // Inherit the color type.

    // Create the new ball at the position of the old one.
    const newBall = new Ball(
      targetBall.x,
      targetBall.y,
      newRadius,
      degradedSymbolId,
      newIsBlack
    );

    // Give it the momentum of the ball it came from.
    // newBall.vx = targetBall.vx;
    // newBall.vy = targetBall.vy;

    newBall.windImmuneUntil =
      Date.now() + Config.degradationWindImmunityDuration;

    // 2.5 --- KNOCKBACK LOGIC START ---
    let knockbackVx = 0;
    let knockbackVy = 0;

    // Calculate the vector pointing from the void ball to the target ball.
    const dx = targetBall.x - voidBall.x;
    const dy = targetBall.y - voidBall.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize the vector (make its length 1) to get a pure direction.
    // We check if distance > 0 to avoid dividing by zero.
    if (distance > 0) {
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;

      // Apply the knockback force from the config.
      knockbackVx = normalizedX * Config.degradationKnockback;
      knockbackVy = normalizedY * Config.degradationKnockback;
    } else {
      // Fallback: If they are perfectly overlapped, push the new ball upwards.
      knockbackVy = -Config.degradationKnockback;
    }

    // Inherit the parent's velocity AND add the new knockback force.
    newBall.vx = targetBall.vx + knockbackVx;
    newBall.vy = targetBall.vy + knockbackVy;
    // --- KNOCKBACK LOGIC END ---

    // 3. Queue the new ball to be added and the old one to be removed.
    GameState.ballsToAddNewThisFrame.push(newBall);
    GameState.ballsToRemoveThisFrame.push(targetBall); // Only remove the target.

    if (
      Config.enableLivesSystem &&
      targetBall.level > Config.minLevelToLoseLife
    ) {
      handleLifeLoss();
    }

    // 4. Spawn particles to give visual feedback of the degradation.
    spawnParticles(
      Config.Construction_Particle_Count, // Use construction particles for feedback
      targetBall.x,
      targetBall.y,
      Config.invertColors ? Config.particleConstructColor.inverted : Config.particleConstructColor.normal,
      Config.Construction_Particle_Speed,
      1,
      4
    );
  } else {
    // Mark only the target symbol for destruction.
    GameState.ballsToRemoveThisFrame.push(targetBall);

    if (
      Config.enableLivesSystem &&
      targetBall.level > Config.minLevelToLoseLife
    ) {
      handleLifeLoss();
    }

    // Give a small point reward for the destruction.
    // GameState.score += symbolDefinitions["S1_VOID"].eliminationPoints;

    // Spawn destruction particles at the collision point.
    spawnParticles(
      Config.Debris_Particle_Count,
      targetBall.x,
      targetBall.y,
      Config.invertColors ? Config.particleDebrisColor.inverted : Config.particleConstructColor.normal,
      Config.Debris_Particle_Speed,
      1,
      4
    );
  }
}

export function isColliding(ballA, ballB) {
  if (ballA.isGrabbed || ballB.isGrabbed) return false;
  const dx = ballA.x - ballB.x;
  const dy = ballA.y - ballB.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < ballA.radius + ballB.radius && distance > 0.1;
}

export function processCollisions() {
  for (let i = 0; i < GameState.balls.length; i++) {
    let ballA = GameState.balls[i];
    if (GameState.ballsToRemoveThisFrame.includes(ballA)) continue;
    for (let j = i + 1; j < GameState.balls.length; j++) {
      let ballB = GameState.balls[j];

      if (
        GameState.ballsToRemoveThisFrame.includes(ballB) ||
        GameState.ballsToRemoveThisFrame.includes(ballA) ||
        ballA.isGrabbed ||
        ballB.isGrabbed
      ) {
        continue;
      }

      const dx = ballA.x - ballB.x;
      const dy = ballA.y - ballB.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (!isColliding(ballA, ballB)) continue;

      if (
        (ballA.symbolId === "S1_VOID" && ballB.symbolId !== "S1_VOID") ||
        (ballB.symbolId === "S1_VOID" && ballA.symbolId !== "S1_VOID")
      ) {
        processVoid(ballA, ballB);
        break;
      }

      const level1 = getLevel(ballA.symbolId);
      const level2 = getLevel(ballB.symbolId);

      const def1 = symbolDefinitions[ballA.symbolId];
      const def2 = symbolDefinitions[ballB.symbolId];

      let destroy = (ballA.symbolId === ballB.symbolId) && !Config.enableWildcard && !Config.enableSimpleCombinationMode && !Config.enableWindCombination;
      if (ballA.symbolId === "S1_VOID" && ballB.symbolId == "S1_VOID") {
        destroy = true;
      }

      if (
        Config.enableWildcard &&
        def1.isWildcard &&
        def2.isWildcard &&
        level1 == level2
      ) {
        destroy = true;
      }

      const midX =
        (ballA.x * ballB.radius + ballB.x * ballA.radius) /
        (ballA.radius + ballB.radius);
      const midY =
        (ballA.y * ballB.radius + ballB.y * ballA.radius) /
        (ballA.radius + ballB.radius);
      const symbolDefA = symbolDefinitions[ballA.symbolId];

      if (ballA.symbolId === ballB.symbolId && ballA.symbolId === "S1_LIFE") {
        if (GameState.lives < Config.maxLives) {
          GameState.lives++;
        }
        GameState.ballsToRemoveThisFrame.push(ballA, ballB);
        // Use the high-level particle burst for a satisfying effect
        spawnHighestLevelParticles(midX, midY);
      }

      if (
        Config.enableHardDegradation &&
        ballA.symbolId === ballB.symbolId &&
        !Config.enableWildcard
      ) {
        const didDegrade = degradeBall(ballA, ballB); // Degrade ball A
        if (
          didDegrade &&
          Config.enableLivesSystem &&
          ballA.level > Config.minLevelToLoseLife
        ) {
          handleLifeLoss();
        }
        break;
      } else if (destroy) {
        if (
          Config.enableLivesSystem &&
          ballA.level > Config.minLevelToLoseLife
        ) {
          handleLifeLoss();
        }

        GameState.ballsToRemoveThisFrame.push(ballA, ballB);
        spawnParticles(
          Config.Construction_Particle_Count,
          midX,
          midY,
          Config.invertColors ? Config.particleConstructColor.inverted : Config.particleConstructColor.normal,
          Config.Construction_Particle_Speed,
          1,
          5,
          Config.PARTICLE_LIFETIME_MS * 0.8,
          false
        );
        // GameState.score += symbolDefA.eliminationPoints;

        if (Config.enableExplosions) {
          createExplosion(symbolDefA, midX, midY);
        }
        break;
      }

      combineSymbols(ballA, ballB);
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
