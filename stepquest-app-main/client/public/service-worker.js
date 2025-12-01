self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("StepQuest PWA Activated");
});
