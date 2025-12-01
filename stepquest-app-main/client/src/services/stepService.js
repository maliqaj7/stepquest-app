let lastAccel = { x: 0, y: 0, z: 0 };
let lastStepTime = 0;

export function startStepTracking(onStep) {
  // iOS permission check
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission()
      .then(response => {
        if (response === "granted") {
          window.addEventListener("devicemotion", handleMotion(onStep));
        } else {
          alert("Motion tracking permission denied.");
        }
      })
      .catch(() => alert("Motion tracking failed."));
  } else {
    // Android or desktop fallback
    window.addEventListener("devicemotion", handleMotion(onStep));
  }
}

function handleMotion(onStep) {
  return (event) => {
    const accel = event.accelerationIncludingGravity;
    if (!accel) return;

    const dx = accel.x - lastAccel.x;
    const dy = accel.y - lastAccel.y;
    const dz = accel.z - lastAccel.z;

    const magnitude = Math.sqrt(dx*dx + dy*dy + dz*dz);
    const now = Date.now();

    // Detect a REAL movement spike (fake steps solved)
    if (magnitude > 1.2 && now - lastStepTime > 600) {
      lastStepTime = now;
      onStep(1);
    }

    lastAccel = accel;
  };
}
