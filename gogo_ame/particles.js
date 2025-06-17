import { Config } from './config.js'; 
import { GameState } from './game_state.js'; 
import { ctx } from './ui.js'; 

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

export function updateAndDrawParticles(deltaTime) {
  for (let i = GameState.particles.length - 1; i >= 0; i--) {
    const p = GameState.particles[i];
    p.x += p.vx * (deltaTime / 16.67);
    p.y += p.vy * (deltaTime / 16.67);
    p.vx *= Config.PARTICLE_FRICTION;
    p.vy *= Config.PARTICLE_FRICTION;
    // p.vy += Config.gravity * 0.2 * (deltaTime / 16.67);
    p.life -= deltaTime;
    p.alpha = Math.max(0, p.life / p.totalLife);
    if (p.life <= 0) {
      GameState.particles.splice(i, 1);
    } else {
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`;
      ctx.beginPath();
      let drawRadius = p.radius * (p.alpha * 0.7 + 0.3);
      drawRadius = Math.max(0, drawRadius);
      ctx.arc(p.x, p.y, drawRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
