(() => {
  "use strict";

  const clock = document.getElementById("clock");
  const now = document.getElementById("clock-now");
  const toggle = document.getElementById("clock-toggle");
  const reset = document.getElementById("clock-reset");
  const steps = [...document.querySelectorAll(".leader-step")];
  if (!clock || !toggle || !reset) return;

  let running = false;
  let startedAt = 0;
  let accumulated = 0;
  let timer = 0;
  let currentStep = null;

  function elapsedMs() {
    return accumulated + (running ? Date.now() - startedAt : 0);
  }

  function format(ms) {
    const total = Math.floor(ms / 1000);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function stepFor(minutes) {
    return steps.find((step) => minutes >= Number(step.dataset.start) && minutes < Number(step.dataset.end)) || null;
  }

  function render() {
    const ms = elapsedMs();
    clock.textContent = format(ms);

    const minutes = ms / 60000;
    const step = stepFor(minutes);
    if (step !== currentStep) {
      steps.forEach((item) => item.removeAttribute("aria-current"));
      currentStep = step;
      if (step) {
        step.setAttribute("aria-current", "step");
        now.textContent = `Now: ${step.querySelector("h3").textContent}`;
      } else if (minutes >= 45) {
        now.textContent = "Past 45 minutes. Land the plane.";
      }
    }
  }

  function start() {
    running = true;
    startedAt = Date.now();
    toggle.textContent = "Pause";
    toggle.setAttribute("aria-pressed", "true");
    timer = window.setInterval(render, 500);
    render();
  }

  function pause() {
    accumulated = elapsedMs();
    running = false;
    window.clearInterval(timer);
    toggle.textContent = "Resume";
    toggle.setAttribute("aria-pressed", "false");
    render();
  }

  toggle.addEventListener("click", () => (running ? pause() : start()));

  reset.addEventListener("click", () => {
    window.clearInterval(timer);
    running = false;
    accumulated = 0;
    currentStep = null;
    steps.forEach((item) => item.removeAttribute("aria-current"));
    toggle.textContent = "Start";
    toggle.setAttribute("aria-pressed", "false");
    clock.textContent = "00:00";
    now.textContent = "Press start when you begin.";
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && running) render();
  });
})();
