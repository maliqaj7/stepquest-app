let lastAccel = { x: 0, y: 0, z: 0 };
let lastStepTime = 0;
let listenerActive = false;

export function startStepTracking(onStep) {
  if (listenerActive) return;                 // prevent DOUBLE registration
  listenerActive = true;

  const handler = createMotionHandler(onStep);

  // iOS permission flow
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission()
      .then((res) => {
        if (res === "granted") {
          window.addEventListener("devicemotion", handler);
        } else {
          alert("Motion permission denied.");
        }
      })
      .catch(() => alert("Motion permission error."));
  } 
  else {
    // Android / desktop accelerometer
    window.addEventListener("devicemotion", handler);
  }
}

function createMotionHandler(onStep) {
  return (event) => {
    const accel = event.accelerationIncludingGravity;
    if (!accel) return;

    // Calculate magnitude of motion change
    const dx = accel.x - lastAccel.x;
    const dy = accel.y - lastAccel.y;
    const dz = accel.z - lastAccel.z;
    const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);

    lastAccel = accel;

    const now = Date.now();

    // -------- REAL STEP DETECTION FILTERS --------
    
    if (magnitude < 2.4) return;        // ignore tiny movements  
    if (now - lastStepTime < 900) return;  // ignore rapid duplicates  

    lastStepTime = now;

    onStep(1);  // count one real step
  };
}
