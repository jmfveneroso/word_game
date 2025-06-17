import { Config } from "./config.js";
import { canvasWidth, canvasHeight, canvas, ctx, controlsDiv } from "./ui.js";
import { GameState, updateUI } from "./game_state.js";

export function addPlayerEvents() {
  canvas.addEventListener("mousedown", function (event) {
    if (GameState.gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    for (let i = GameState.balls.length - 1; i >= 0; i--) {
      let ball = GameState.balls[i];
      if (ball.isGrabbed) continue;
      const distance = Math.sqrt(
        (clickX - ball.x) ** 2 + (clickY - ball.y) ** 2
      );
      if (distance < ball.radius) {
        GameState.grabbedBall = ball;
        GameState.grabbedBall.isGrabbed = true;
        GameState.grabbedBall.vx = 0;
        GameState.grabbedBall.vy = 0;
        GameState.lastMouseX = event.clientX;
        GameState.lastMouseY = event.clientY;
        canvas.classList.add("grabbing");
        break;
      }
    }
  });

  // Replace the entire 'mousemove' event listener with this new implementation
  document.addEventListener("mousemove", function (event) {
    if (GameState.grabbedBall) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Calculate the vector from the original grab point

      // Uncomment for slingshot.
      // const deltaX = GameState.grabbedBall.x - mouseX;
      // const deltaY = GameState.grabbedBall.y - mouseY;
      const deltaX = mouseX - GameState.grabbedBall.x;
      const deltaY = mouseY - GameState.grabbedBall.y;
      const mag = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (mag > 0) {
        // Cap the magnitude at the max strength
        const cappedMag = Math.min(mag, Config.slingshotMaxStrength);
        const launchX = (deltaX / mag) * cappedMag;
        const launchY = (deltaY / mag) * cappedMag;
        GameState.grabbedBall.slingshotVector = { x: launchX, y: launchY };
      }

      // Uncomment for drag.
      // if (GameState.grabbedBall.slingshotVector) {
      //   GameState.grabbedBall.vx =
      //     GameState.grabbedBall.slingshotVector.x *
      //     Config.slingshotPowerMultiplier;
      //   GameState.grabbedBall.vy =
      //     GameState.grabbedBall.slingshotVector.y *
      //     Config.slingshotPowerMultiplier;
      // }
    }
  });

  // Replace the entire 'mouseup' event listener with this new implementation
  document.addEventListener("mouseup", function () {
    if (GameState.grabbedBall) {
      // Apply the slingshot vector as velocity
      if (GameState.grabbedBall.slingshotVector) {
        GameState.grabbedBall.vx =
          GameState.grabbedBall.slingshotVector.x *
          Config.slingshotPowerMultiplier;
        GameState.grabbedBall.vy =
          GameState.grabbedBall.slingshotVector.y *
          Config.slingshotPowerMultiplier;
      }

      // Reset and release the ball
      GameState.grabbedBall.isGrabbed = false;
      GameState.grabbedBall.slingshotVector = { x: 0, y: 0 };
      GameState.grabbedBall = null;
      canvas.classList.remove("grabbing");
    }
  });
}
