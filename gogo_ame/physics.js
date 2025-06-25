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

export function destroyBall(targetBall) {
  GameState.ballsToRemoveThisFrame.push(targetBall);

  spawnParticles(
    Config.Debris_Particle_Count,
    targetBall.x,
    targetBall.y,
    Config.invertColors
      ? Config.particleDebrisColor.inverted
      : Config.particleConstructColor.normal,
    Config.Debris_Particle_Speed,
    1,
    4
  );

  if (
    Config.enableLivesSystem &&
    targetBall.level > Config.minLevelToLoseLife
  ) {
    handleLifeLoss();
  }
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

function gainPoints(newBall) {
  const pointsGained = Math.pow(newBall.level, 2);
  GameState.score += pointsGained;
  GameState.isAnimatingHighestScore = true;
  GameState.isAnimatingHighestScoreStart = Date.now();

  GameState.particles.push({
    type: "scorePopup",
    x: newBall.x,
    y: newBall.y - 20,
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
      type: "scorePopup",
      x: centerX,
      y: centerY + 20,
      text: `+${pointsGained}`,
      life: Config.scorePopupLifetime,
      totalLife: Config.scorePopupLifetime,
      vy: Config.scorePopupUpwardSpeed, // Negative Y is up
    });
  }
}

function createBall(ballA, ballB, combinedSymId) {
  const productDef = symbolDefinitions[combinedSymId];

  const sizeMultiplier =
    1.0 + (productDef.level - 1) * Config.sizeIncreasePerLevel;
  let newRadius = Config.baseBallRadius * sizeMultiplier;
  newRadius = Math.max(5, newRadius); // Use 5 to match environment.js

  const midX =
    (ballA.x * ballB.radius + ballB.x * ballA.radius) /
    (ballA.radius + ballB.radius);
  const midY =
    (ballA.y * ballB.radius + ballB.y * ballA.radius) /
    (ballA.radius + ballB.radius);

  const totalMassProxy = ballA.radius + ballB.radius;
  const newVx =
    (ballA.vx * ballA.radius + ballB.vx * ballB.radius) / totalMassProxy;
  const newVy =
    (ballA.vy * ballA.radius + ballB.vy * ballB.radius) / totalMassProxy;
  const newBall = new Ball(midX, midY, newRadius, combinedSymId, false);
  newBall.vx = newVx;
  newBall.vy = newVy;
  newBall.gravityImmuneUntil = Date.now() + Config.windGravityImmunityDuration + Config.levitationLevelMultiplier * productDef.level;
  return newBall;
}

function playHighestLevelAnimation(newBall) {
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

  spawnHighestLevelParticles(newBall.x, newBall.y);
}

function combineSymbols(ballA, ballB) {
  if (
    Config.enableZeroGravityMode &&
    !ballA.hasBeenManipulated &&
    !ballB.hasBeenManipulated
  ) {
    return false;
  }

  let combinedSymId = getCombinedSymbolId(ballA.symbolId, ballB.symbolId);
  if (!combinedSymId) {
    return false;
  }

  const newBall = createBall(ballA, ballB, combinedSymId);

  GameState.ballsToRemoveThisFrame.push(ballA, ballB);
  GameState.ballsToAddNewThisFrame.push(newBall);

  if (newBall.level > 2) {
    gainPoints(newBall);
  }

  if (newBall.level > GameState.highestLevelAchieved) {
    playHighestLevelAnimation(newBall);
  }

  // Play construction particle effect.
  spawnParticles(
    Config.Construction_Particle_Count,
    newBall.x,
    newBall.y,
    Config.invertColors
      ? Config.particleConstructColor.inverted
      : Config.particleConstructColor.normal,
    Config.Construction_Particle_Speed,
    1,
    5,
    Config.PARTICLE_LIFETIME_MS * 0.8,
    false
  );
  return true;
}

function collideSimpleWithComplexSymbol(ballA, ballB) {
  if (ballA.level != 1 && ballB.level != 1) {
    return false;
  }

  const combinedLevel = ballA.level + ballB.level;
  if (combinedLevel <= 2) {
    return false;
  }

  const simpleBall = ballA.level > ballB.level ? ballB : ballA;
  const complexBall = ballA.level > ballB.level ? ballA : ballB;

  if (!Config.enableCollision) {
    return true;
  }

  if (Config.enableImmunity) {
    destroyBall(simpleBall);
    return true;
  }

  return false;
}

function bounce(ballA, ballB) {
  const dx = ballA.x - ballB.x;
  const dy = ballA.y - ballB.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // 1. Resolve Overlap
  // This pushes the balls apart slightly so they don't get stuck inside each other.
  const overlap = ballA.radius + ballB.radius - distance;
  if (overlap > 0) {
    const totalMass = ballA.radius + ballB.radius;
    // The amount each ball is pushed is inversely proportional to its mass
    const pushFactor = overlap / totalMass;

    ballA.x += (dx / distance) * ballB.radius * pushFactor;
    ballA.y += (dy / distance) * ballB.radius * pushFactor;
    ballB.x -= (dx / distance) * ballA.radius * pushFactor;
    ballB.y -= (dy / distance) * ballA.radius * pushFactor;
  }

  // 2. Calculate Bounce Physics (2D Elastic Collision)

  // Find the normal and tangent vectors of the collision plane
  const normalX = dx / distance;
  const normalY = dy / distance;
  const tangentX = -normalY;
  const tangentY = normalX;

  // Project the velocities of each ball onto the normal and tangent vectors
  const v1n = ballA.vx * normalX + ballA.vy * normalY; // ballA's velocity along the normal
  const v1t = ballA.vx * tangentX + ballA.vy * tangentY; // ballA's velocity along the tangent
  const v2n = ballB.vx * normalX + ballB.vy * normalY;
  const v2t = ballB.vx * tangentX + ballB.vy * tangentY;

  // Use radius as a proxy for mass
  const m1 = ballA.radius;
  const m2 = ballB.radius;

  // Perform a 1D elastic collision calculation on the normal velocities
  const v1n_final = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
  const v2n_final = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

  // The tangential velocities remain unchanged after the collision
  // Convert the final scalar velocities back into vectors
  const v1nVecX = v1n_final * normalX;
  const v1nVecY = v1n_final * normalY;
  const v1tVecX = v1t * tangentX;
  const v1tVecY = v1t * tangentY;

  const v2nVecX = v2n_final * normalX;
  const v2nVecY = v2n_final * normalY;
  const v2tVecX = v2t * tangentX;
  const v2tVecY = v2t * tangentY;

  // Recombine the normal and tangent vectors to get the final velocity
  ballA.vx = v1nVecX + v1tVecX;
  ballA.vy = v1nVecY + v1tVecY;
  ballB.vx = v2nVecX + v2tVecX;
  ballB.vy = v2nVecY + v2tVecY;
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
          Config.invertColors
            ? Config.particleDebrisColor.inverted
            : Config.particleDebrisColor.normal,
          Config.Debris_Particle_Speed,
          1,
          4
        );
      }
    }
  }
}

export function collideWithVoid(ballA, ballB) {
  if (
    !(
      (ballA.symbolId === "S1_VOID" && ballB.symbolId !== "S1_VOID") ||
      (ballB.symbolId === "S1_VOID" && ballA.symbolId !== "S1_VOID")
    )
  ) {
    return false;
  }

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
      Config.invertColors
        ? Config.particleConstructColor.inverted
        : Config.particleConstructColor.normal,
      Config.Construction_Particle_Speed,
      1,
      4
    );
    return true;
  }

  destroyBall(targetBall);
  return true;
}

export function isColliding(ballA, ballB) {
  if (
    GameState.ballsToRemoveThisFrame.includes(ballB) ||
    GameState.ballsToRemoveThisFrame.includes(ballA) ||
    ballA.isGrabbed ||
    ballB.isGrabbed
  ) {
    return false;
  }

  const dx = ballA.x - ballB.x;
  const dy = ballA.y - ballB.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < ballA.radius + ballB.radius && distance > 0.1;
}

function shouldDestroy(ballA, ballB) {
  let destroy =
    ballA.symbolId === ballB.symbolId &&
    !Config.enableWildcard &&
    !Config.enableSimpleCombinationMode &&
    !Config.enableWindCombination;

  if (
    Config.enableWildcard &&
    def1.isWildcard &&
    def2.isWildcard &&
    level1 == level2
  ) {
    destroy = true;
  }
  return destroy;
}

function destroySymbols(ballA, ballB) {
  let destroy = shouldDestroy(ballA, ballB);
  if (!destroy) {
    return false;
  }

  const midX =
    (ballA.x * ballB.radius + ballB.x * ballA.radius) /
    (ballA.radius + ballB.radius);
  const midY =
    (ballA.y * ballB.radius + ballB.y * ballA.radius) /
    (ballA.radius + ballB.radius);

  if (Config.enableLivesSystem && ballA.level > Config.minLevelToLoseLife) {
    handleLifeLoss();
  }

  GameState.ballsToRemoveThisFrame.push(ballA, ballB);
  spawnParticles(
    Config.Construction_Particle_Count,
    midX,
    midY,
    Config.invertColors
      ? Config.particleConstructColor.inverted
      : Config.particleConstructColor.normal,
    Config.Construction_Particle_Speed,
    1,
    5,
    Config.PARTICLE_LIFETIME_MS * 0.8,
    false
  );

  if (Config.enableExplosions) {
    createExplosion(symbolDefA, midX, midY);
  }
  return true;
}

function collideLife(ballA, ballB) {
  if (ballA.symbolId === ballB.symbolId && ballA.symbolId === "S1_LIFE") {
    if (GameState.lives < Config.maxLives) {
      GameState.lives++;
    }
    GameState.ballsToRemoveThisFrame.push(ballA, ballB);
    spawnHighestLevelParticles(midX, midY);
    return true;
  }
  return false;
}

function degradeOnSameSymbolCollision(ballA, ballB) {
  if (
    ballA.symbolId === ballB.symbolId &&
    Config.enableHardDegradation &&
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
    return true;
  }
  return false;
}

export function processCollision(ballA, ballB) {
  if (collideWithVoid(ballA, ballB)) {
    return;
  }

  if (collideLife(ballA, ballB)) {
    return;
  }

  if (degradeOnSameSymbolCollision(ballA, ballB)) {
    return;
  }

  if (destroySymbols(ballA, ballB)) {
    return;
  }

  if (combineSymbols(ballA, ballB)) {
    return;
  }

  if (collideSimpleWithComplexSymbol(ballA, ballB)) {
    return;
  }

  bounce(ballA, ballB);
}

export function processCollisions() {
  for (let i = 0; i < GameState.balls.length; i++) {
    let ballA = GameState.balls[i];
    if (GameState.ballsToRemoveThisFrame.includes(ballA)) continue;

    for (let j = i + 1; j < GameState.balls.length; j++) {
      let ballB = GameState.balls[j];

      if (!isColliding(ballA, ballB)) continue;

      processCollision(ballA, ballB);
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
