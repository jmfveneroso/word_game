import { Config } from "./config.js";
import { GameState } from "./game_state.js";
import { ctx } from "./ui.js";

export function spawnParticles(
  count,
  x,
  y,
  color,
  maxSpeed,
  minSize,
  maxSize,
  life = Config.PARTICLE_LIFETIME_MS,
  outwardBias = true
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * maxSpeed + 0.5;
    GameState.particles.push({
      x,
      y,
      vx: outwardBias
        ? Math.cos(angle) * speed
        : (Math.random() - 0.5) * maxSpeed * 1.5,
      vy: outwardBias
        ? Math.sin(angle) * speed
        : (Math.random() - 0.5) * maxSpeed * 1.5,
      radius: Math.random() * (maxSize - minSize) + minSize,
      color: color,
      alpha: 1.0,
      life: life * (Math.random() * 0.6 + 0.7),
      totalLife: life,
    });
  }
}

export function spawnParticlesAlongCurve(cfg) {
  if (!GameState.windCurve) return;

  const points = GameState.windCurve.points;
  if (points.length < 2) return;

  for (let i = 0; i < cfg.windParticlesPerFrame; i++) {
    // 1. Pick a random spot along the entire curve's length
    const segmentIndex = Math.floor(Math.random() * (points.length - 1));
    const p1 = points[segmentIndex];
    const p2 = points[segmentIndex + 1];

    // 2. Calculate the base spawn position on that segment
    const t = Math.random();
    const spawnX = p1.x + (p2.x - p1.x) * t;
    const spawnY = p1.y + (p2.y - p1.y) * t;

    // 3. Calculate a random offset perpendicular to the curve direction
    const tangentX = p2.x - p1.x;
    const tangentY = p2.y - p1.y;
    const mag = Math.sqrt(tangentX * tangentX + tangentY * tangentY);

    if (mag > 0) {
      const normalX = -tangentY / mag;
      const normalY = tangentX / mag;

      // Random distance from -spread/2 to +spread/2
      const offsetDistance = (Math.random() - 0.5) * cfg.windParticleSpread;

      const particleX = spawnX + normalX * offsetDistance;
      const particleY = spawnY + normalY * offsetDistance;

      // 4. Create the new particle with the offset position
      GameState.particles.push({
        type: "wind",
        x: particleX,
        y: particleY,
        life: cfg.windParticleLifetime * (0.5 + Math.random() * 0.5),
        totalLife: cfg.windParticleLifetime,
        speed:
          cfg.windParticleBaseSpeed +
          Math.random() * cfg.windParticleSpeedVariance,
        curve: GameState.windCurve,
        curveIndex: segmentIndex,
        color: cfg.invertColors
          ? cfg.windParticleColor.inverted
          : cfg.windParticleColor.normal,
        offsetDistance: offsetDistance,
        vx: 0,
        vy: 0,
        detached: false,
        trail: [],
      });
    }
  }
}

export function updateAndDrawParticles(deltaTime) {
  for (let i = GameState.particles.length - 1; i >= 0; i--) {
    const p = GameState.particles[i];

    // --- NEW: Record trail BEFORE the particle moves ---
    if (p.type === "wind") {
      p.trail.push({ x: p.x, y: p.y });
      // Keep the trail from getting too long
      if (p.trail.length > Config.windParticleTrailLength) {
        p.trail.shift();
      }
    }

    // --- (The existing physics logic for all particle types remains here) ---
    if (p.type === "wind") {
      // First, check if a following particle should detach from the curve
      if (
        !p.detached &&
        (!p.curve ||
          p.curve.points.length <= p.curveIndex + 1 ||
          !GameState.windCurve ||
          GameState.windCurve.points.length < 2)
      ) {
        p.detached = true; // It has reached the end, so it detaches.
      }

      // --- Apply physics based on state (following vs. detached) ---
      if (p.detached) {
        // DETACHED: Particle now moves freely based on its last momentum.
        p.x += p.vx;
        p.y += p.vy;
        // Apply friction to slow it down naturally.
        p.vx *= Config.PARTICLE_FRICTION;
        p.vy *= Config.PARTICLE_FRICTION;
        p.life -= deltaTime * 4;
      } else {
        // FOLLOWING: Particle actively follows its parallel path along the curve.
        const p1 = p.curve.points[p.curveIndex];
        const p2 = p.curve.points[p.curveIndex + 1];

        const tangentX = p2.x - p1.x;
        const tangentY = p2.y - p1.y;
        const mag = Math.sqrt(tangentX * tangentX + tangentY * tangentY);

        if (mag > 0) {
          const normalX = -tangentY / mag;
          const normalY = tangentX / mag;

          const targetX = p2.x + normalX * p.offsetDistance;
          const targetY = p2.y + normalY * p.offsetDistance;

          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const distToTarget = Math.sqrt(dx * dx + dy * dy);

          // Calculate the velocity for this frame
          const moveX = (dx / distToTarget) * p.speed;
          const moveY = (dy / distToTarget) * p.speed;

          if (distToTarget > p.speed) {
            p.x += moveX;
            p.y += moveY;
          } else {
            p.x = targetX;
            p.y = targetY;
            p.curveIndex++;
          }

          p.vx = moveX;
          p.vy = moveY;
        } else {
          p.curveIndex++;
        }
      }
    } else if (p.type === "scorePopup") {
      // This particle just floats upwards and slows down
      p.y += p.vy;
      p.vy *= 0.98; // Apply some friction to the upward movement
    } else {
      // Logic for debris particles remains the same
      p.x += p.vx * (deltaTime / 16.67);
      p.y += p.vy * (deltaTime / 16.67);
      p.vx *= Config.PARTICLE_FRICTION;
      p.vy *= Config.PARTICLE_FRICTION;
    }

    p.life -= deltaTime;
    p.alpha = Math.max(0, p.life / p.totalLife);
    if (p.life <= 0) {
      GameState.particles.splice(i, 1);
    } else {
      if (p.type === "scorePopup") {
        const progress = p.life / p.totalLife;
        // The text starts large and shrinks slightly as it fades
        const fontSize = Config.scorePopupFontSize * (0.5 + progress * 0.5);

        const color = Config.invertColors
          ? Config.scorePopupColor.inverted
          : Config.scorePopupColor.normal;
        ctx.fillStyle = color.replace(/[^,]+(?=\))/, p.alpha.toFixed(2));

        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === "wind" && p.trail.length > 0) {
        ctx.beginPath();
        for (let j = 0; j < p.trail.length; j++) {
          const trailPoint = p.trail[j];
          const progress = j / p.trail.length; // 0 for oldest, 1 for newest

          // Trail segments get smaller and fainter as they get older
          const trailRadius =
            (p.type === "wind" ? 2 : p.radius) * progress * p.alpha;
          const trailAlpha = p.alpha * progress * 0.5; // Make trail fainter than the head

          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${trailAlpha})`;

          // Move to the point and draw a circle segment
          ctx.moveTo(trailPoint.x + trailRadius, trailPoint.y);
          ctx.arc(trailPoint.x, trailPoint.y, trailRadius, 0, Math.PI * 2);
        }
        ctx.fill();
      } else {
        // 2. Draw the main particle head on top of the trail
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
        ctx.beginPath();
        let drawRadius =
          p.type === "wind" ? 2 : p.radius * (p.alpha * 0.7 + 0.3);
        drawRadius = Math.max(0, drawRadius);
        ctx.arc(p.x, p.y, drawRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

export function spawnHighestLevelParticles(centerX, centerY) {
  for (let i = 0; i < Config.highestLevelParticleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * Config.highestLevelParticleSpeed + 1;

    // Spawn particles in a circle around the given center point
    const spawnRadius = 80; // The radius of the burst circle
    const x = centerX + Math.cos(angle) * spawnRadius;
    const y = centerY + Math.sin(angle) * spawnRadius;

    GameState.particles.push({
      // We can reuse the 'debris' type or create a new 'gold' type.
      // For now, let's reuse 'debris' as it already has velocity properties.
      type: "debris",
      x: x,
      y: y,
      // Give particles an initial upward velocity to create a "burst" effect
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * speed,
      radius: Math.random() * 3 + 1,
      color: Config.invertColors
        ? Config.highestLevelParticleColor.inverted
        : Config.highestLevelParticleColor.normal,
      life: Config.highestLevelParticleLifetime * (0.7 + Math.random() * 0.3),
      totalLife: Config.highestLevelParticleLifetime,
    });
  }
}
