// src/services/stepService.js

// For now this is just a fake service.
// Later you can replace this with Google Fit / Apple HealthKit calls.

export async function fetchNewSteps() {
  // Imagine this is calling a real pedometer API.
  // For the prototype, we just return a fixed number.
  const simulatedSteps = 500;

  // You could randomise this a bit if you want:
  // const simulatedSteps = 200 + Math.floor(Math.random() * 600);

  return simulatedSteps;
}
