let lastAccel = { x: 0, y: 0, z: 0 };
let stepCount = 0;
let threshold = 1.2; // Adjust if sensitivity is too high/low

export function startStepTracking(callback) {
  if (typeof DeviceMotionEvent === "undefined") {
    console.warn("DeviceMotion is not supported.");
    return;
  }

  // iPhone permission
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission().then((response) => {
      if (response === "granted") {
        window.addEventListener("devicemotion", (event) =>
          handleStep(event, callback)
        );
      }
    });
  } else {
    // Android
    window.addEventListener("devicemotion", (event) =>
      handleStep(event, callback)
    );
  }
}

function handleStep(event, callback) {
  const { x, y, z } = event.accelerationIncludingGravity;

  const diff =
    Math.abs(x - lastAccel.x) +
    Math.abs(y - lastAccel.y) +
    Math.abs(z - lastAccel.z);

  if (diff > threshold) {
    stepCount++;
    callback(stepCount); // Sends step count to Home
  }

  lastAccel = { x, y, z };
}
