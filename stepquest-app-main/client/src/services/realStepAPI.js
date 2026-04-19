/**
 * realStepAPI.js — Improved Step Detection
 *
 * Algorithm:
 *  1. Prefer event.acceleration (gravity-free). Fall back to
 *     accelerationIncludingGravity with a software low-pass filter to
 *     remove the ~9.8 m/s² gravity component.
 *  2. Compute the magnitude of the filtered linear acceleration vector.
 *  3. Use sliding-window peak detection:
 *       • Track a smoothed (low-pass) baseline of the magnitude.
 *       • A step is detected when the signal rises above
 *         (baseline + STEP_THRESHOLD) and then falls back below it —
 *         i.e. we detect the *peak* not just any crossing.
 *  4. Enforce a minimum inter-step gap (DEBOUNCE_MS) to reject noise bursts.
 *
 * This removes the need to "shake" the phone and correctly detects normal,
 * relaxed walking with the phone in hand, pocket, or swinging at the side.
 */

// ─── CONFIG ────────────────────────────────────────────────────────────────
const STEP_THRESHOLD   = 1.2;   // m/s² above smoothed baseline to count a peak
const DEBOUNCE_MS      = 350;   // minimum ms between counted steps (~171 spm max)
const GRAVITY_ALPHA    = 0.8;   // low-pass smoothing for gravity isolation (0–1)
const BASELINE_ALPHA   = 0.95;  // low-pass smoothing for magnitude baseline

// ─── MODULE-LEVEL STATE ────────────────────────────────────────────────────
let gravity        = { x: 0, y: 0, z: 0 };
let magnitudeBase  = 0;          // smoothed magnitude baseline
let aboveThreshold = false;      // are we currently in a "peak"?
let lastStepTime   = 0;
let listenerActive = false;
let activeHandler  = null;
let currentOnStep  = null;

// ─── PUBLIC API ────────────────────────────────────────────────────────────

export function startStepTracking(onStep, onError) {
  currentOnStep = onStep;

  if (listenerActive) return; // prevent double-registration

  const handler = createMotionHandler();
  activeHandler = handler;

  // iOS 13+ requires explicit permission
  if (typeof DeviceMotionEvent?.requestPermission === "function") {
    DeviceMotionEvent.requestPermission()
      .then((res) => {
        if (res === "granted") {
          window.addEventListener("devicemotion", handler);
          listenerActive = true;
        } else {
          if (onError) onError("Motion permission denied. Step tracking disabled.");
        }
      })
      .catch(() => {
        if (onError) onError("Motion permission error. Step tracking disabled.");
      });
  } else {
    // Android / Chrome on desktop with accelerometer
    window.addEventListener("devicemotion", handler);
    listenerActive = true;
  }
}

export function stopStepTracking() {
  if (activeHandler) {
    window.removeEventListener("devicemotion", activeHandler);
    activeHandler = null;
  }
  listenerActive = false;
  // Reset filter state so re-start is clean
  gravity        = { x: 0, y: 0, z: 0 };
  magnitudeBase  = 0;
  aboveThreshold = false;
  lastStepTime   = 0;
}

// ─── INTERNAL ──────────────────────────────────────────────────────────────

function createMotionHandler() {
  return (event) => {
    let ax, ay, az;

    // ── 1. Get linear acceleration (gravity-free) ──────────────────────
    const linAccel = event.acceleration; // null on some Android devices
    if (linAccel && linAccel.x != null) {
      // Browser already removed gravity for us — ideal path
      ax = linAccel.x;
      ay = linAccel.y;
      az = linAccel.z;
    } else {
      // Fallback: isolate gravity via exponential low-pass filter,
      // then subtract from raw reading to get linear acceleration.
      const raw = event.accelerationIncludingGravity;
      if (!raw || raw.x == null) return;

      gravity.x = GRAVITY_ALPHA * gravity.x + (1 - GRAVITY_ALPHA) * raw.x;
      gravity.y = GRAVITY_ALPHA * gravity.y + (1 - GRAVITY_ALPHA) * raw.y;
      gravity.z = GRAVITY_ALPHA * gravity.z + (1 - GRAVITY_ALPHA) * raw.z;

      ax = raw.x - gravity.x;
      ay = raw.y - gravity.y;
      az = raw.z - gravity.z;
    }

    // ── 2. Compute magnitude of linear acceleration vector ─────────────
    const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);

    // ── 3. Update smoothed baseline ────────────────────────────────────
    // Use a slow low-pass filter so baseline tracks ambient noise floor
    magnitudeBase = BASELINE_ALPHA * magnitudeBase + (1 - BASELINE_ALPHA) * magnitude;

    // ── 4. Peak detection ──────────────────────────────────────────────
    const isAbove = magnitude > magnitudeBase + STEP_THRESHOLD;

    if (isAbove && !aboveThreshold) {
      // Rising edge — we entered a peak
      aboveThreshold = true;
    } else if (!isAbove && aboveThreshold) {
      // Falling edge — peak has ended → count ONE step
      aboveThreshold = false;

      const now = Date.now();
      if (now - lastStepTime >= DEBOUNCE_MS) {
        lastStepTime = now;
        if (currentOnStep) currentOnStep(1);
      }
    }
  };
}
