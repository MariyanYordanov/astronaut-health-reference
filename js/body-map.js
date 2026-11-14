/*
  AstroVitals - body-map.js
  Makes the SVG figure interactive: colors each organ by status and shows
  details when an organ is clicked (or chosen with the keyboard).

  License: MIT (see LICENSE)
  AI disclosure: drafted with the help of Claude (Anthropic), reviewed by the team.

  Needs: thresholds.js and evaluate.js loaded before this file.
*/

/* Short explanation for every organ.
   "hazard" links the organ to the five hazards of human spaceflight
   described by the NASA Human Research Program (RIDGE).
   Sources: NASA Human Research Program - 5 Hazards of Human Spaceflight;
   NASA - Astronaut Exercise; NASA - Counteracting Bone and Muscle Loss in
   Microgravity (links in README.md). */
const ORGAN_INFO = {
  brain: {
    name: "Brain",
    description: "Sleep and mood show how the mind is coping with the mission.",
    hazard: "Isolation & confinement, Distance from Earth: months in a small space, far from home, can disturb sleep and mood."
  },
  lungs: {
    name: "Lungs",
    description: "Oxygen saturation shows how well oxygen reaches the blood.",
    hazard: "Hostile closed environment: the crew breathes recycled air, so air quality matters every day."
  },
  heart: {
    name: "Heart",
    description: "Heart rate and blood pressure show how the heart and blood vessels are working.",
    hazard: "Gravity fields: without gravity, body fluids shift toward the head and the heart works differently."
  },
  muscles: {
    name: "Muscles",
    description: "Daily exercise and body weight help track muscle condition.",
    hazard: "Gravity fields: muscles weaken when they do not carry the body's weight. Exercise is the main countermeasure."
  },
  bones: {
    name: "Bones",
    description: "Bone loss cannot be felt, so daily exercise is tracked instead.",
    hazard: "Gravity fields: bones lose density in microgravity. Station crews exercise about two hours a day to slow this."
  }
};

const STATUS_WORDS = {
  none: "No data",
  green: "OK",
  yellow: "Attention",
  red: "Action needed"
};

const BodyMap = {

  selectedOrgan: null,   // which organ is open in the details box
  lastEvaluation: null,  // newest result from Evaluator.evaluateEntry()

  /* Call once when the page loads: attaches click and keyboard handlers */
  init() {
    document.querySelectorAll("#body-map .organ").forEach((element) => {
      element.addEventListener("click", () => {
        this.select(element.dataset.organ);
      });

      // Enter or Space works like a click (keyboard accessibility)
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.select(element.dataset.organ);
        }
      });
    });
  },

  /* Call after every evaluation: recolors the organs */
  update(evaluation) {
    this.lastEvaluation = evaluation;

    document.querySelectorAll("#body-map .organ").forEach((element) => {
      const status = evaluation.organs[element.dataset.organ] || "none";

      element.classList.remove("status-green", "status-yellow", "status-red");
      if (status !== "none") {
        element.classList.add("status-" + status);
      }

      // Screen readers hear the status too, not only the color
      const info = ORGAN_INFO[element.dataset.organ];
      element.setAttribute("aria-label", info.name + ": " + STATUS_WORDS[status]);
    });

    // Refresh the details box if an organ is already open
    if (this.selectedOrgan) {
      this.showDetails(this.selectedOrgan);
    }
  },

  /* Marks an organ as selected and shows its details */
  select(organ) {
    this.selectedOrgan = organ;

    document.querySelectorAll("#body-map .organ").forEach((element) => {
      element.classList.toggle("selected", element.dataset.organ === organ);
    });

    this.showDetails(organ);
  },

  /* Fills the details box under the figure */
  showDetails(organ) {
    const info = ORGAN_INFO[organ];
    const evaluation = this.lastEvaluation;
    const status = evaluation ? evaluation.organs[organ] : "none";

    document.getElementById("organ-name").textContent =
      info.name + " - " + STATUS_WORDS[status];
    document.getElementById("organ-description").textContent = info.description;
    document.getElementById("organ-hazard").textContent = info.hazard;

    // List the readings that belong to this organ
    const list = document.getElementById("organ-readings");
    list.textContent = "";   // remove old rows

    const readings = evaluation
      ? evaluation.readings.filter((r) => THRESHOLDS[r.key].organs.includes(organ))
      : [];

    if (readings.length === 0) {
      const item = document.createElement("li");
      item.textContent = "No readings for this organ yet.";
      list.appendChild(item);
      return;
    }

    readings.forEach((reading) => {
      const item = document.createElement("li");
      item.className = "status-" + reading.status;
      item.textContent =
        reading.label + ": " + reading.value + " " + reading.unit + " - " + reading.text;
      list.appendChild(item);
    });
  }
};
