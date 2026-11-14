/*
  AstroVitals - app.js
  The "glue": reads the form, saves the check-in, and refreshes the status
  panel, the body map and the chart.

  License: MIT (see LICENSE)
  AI disclosure: drafted with the help of Claude (Anthropic), reviewed by the team.

  Needs (in this order): thresholds.js, storage.js, evaluate.js,
  body-map.js, charts.js.
*/

/* Names of the form fields (same as the "name" attributes in index.html) */
const REQUIRED_FIELDS = ["heartRate", "bpSystolic", "bpDiastolic", "glucose", "temperature", "sleep", "mood"];
const OPTIONAL_FIELDS = ["spo2", "weight", "exercise"];

const OVERALL_LABELS = {
  none: "No data yet",
  green: "ALL CLEAR - readings are within reference ranges",
  yellow: "ATTENTION - some readings are outside reference ranges",
  red: "ACTION NEEDED - notify the ground medical team"
};

const App = {

  /* Runs once when the page is ready */
  init() {
    BodyMap.init();

    document.getElementById("vitals-form").addEventListener("submit", (event) => {
      event.preventDefault();   // stop the browser from reloading the page
      this.handleSubmit(event.target);
    });

    document.getElementById("chart-metric").addEventListener("change", () => {
      this.refreshChart();
    });

    document.getElementById("load-sample").addEventListener("click", () => {
      this.loadSampleData();
    });

    document.getElementById("clear-history").addEventListener("click", () => {
      if (window.confirm("Delete all saved check-ins from this browser?")) {
        VitalsStore.clearEntries();
        this.refresh();
      }
    });

    this.renderSources();
    this.refresh();
  },

  /* Reads the form and returns a check-in object: { heartRate: 72, ... } */
  readForm(form) {
    const data = new FormData(form);
    const entry = {};

    REQUIRED_FIELDS.concat(OPTIONAL_FIELDS).forEach((name) => {
      const text = data.get(name);
      if (text === null || text.trim() === "") return;   // empty optional field
      entry[name] = Number(text);
    });

    return entry;
  },

  handleSubmit(form) {
    // Built-in browser validation (required, min, max). Shows its own messages.
    if (!form.reportValidity()) return;

    VitalsStore.saveEntry(this.readForm(form));
    form.reset();
    this.refresh();
  },

  /* Redraws everything from the saved data */
  refresh() {
    const entries = VitalsStore.loadEntries();
    const latest = entries.length > 0 ? entries[entries.length - 1] : null;
    const evaluation = Evaluator.evaluateEntry(latest);

    this.renderHeader(entries);
    this.renderStatus(evaluation);
    BodyMap.update(evaluation);
    this.refreshChart();

    // Tell the user when data is simulated or cannot be saved
    document.getElementById("sample-banner").hidden = !entries.some((entry) => entry.sample === true);
    document.getElementById("storage-warning").hidden = VitalsStore.persistent;
  },

  refreshChart() {
    const metricKey = document.getElementById("chart-metric").value;
    TrendChart.render(VitalsStore.loadEntries(), metricKey);
  },

  /* Mission day and time of the last check-in */
  renderHeader(entries) {
    const dayElement = document.getElementById("mission-day");
    const lastElement = document.getElementById("last-checkin");

    if (entries.length === 0) {
      dayElement.textContent = "--";
      lastElement.textContent = "--";
      return;
    }

    // Mission day = days since the first check-in (day 1 = first check-in).
    // A real mission would use the launch date instead.
    const first = new Date(entries[0].timestamp);
    const last = new Date(entries[entries.length - 1].timestamp);
    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    dayElement.textContent = Math.floor((Date.now() - first.getTime()) / MS_PER_DAY) + 1;
    lastElement.textContent = last.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  },

  /* Fills the Health Status panel */
  renderStatus(evaluation) {
    // Overall status
    const overall = document.getElementById("overall-status");
    overall.classList.remove("status-green", "status-yellow", "status-red");
    if (evaluation.overall !== "none") {
      overall.classList.add("status-" + evaluation.overall);
    }
    overall.querySelector(".status-label").textContent = OVERALL_LABELS[evaluation.overall];

    // One row per reading
    const list = document.getElementById("status-list");
    list.textContent = "";
    evaluation.readings.forEach((reading) => {
      const item = document.createElement("li");
      item.className = "status-" + reading.status;
      item.title = "Reference: " + reading.sourceName;   // shown on hover

      const text = document.createElement("span");
      text.textContent = reading.label + ": " + reading.value + " " + reading.unit + " - " + reading.text;
      item.appendChild(text);
      list.appendChild(item);
    });

    // Suggested actions
    const guidance = document.getElementById("guidance-list");
    guidance.textContent = "";
    const advice = evaluation.guidance.length > 0
      ? evaluation.guidance
      : ["Save a check-in to get suggestions."];
    advice.forEach((line) => {
      const item = document.createElement("li");
      item.textContent = line;
      guidance.appendChild(item);
    });

    // Alert for the ground medical team (only when a reading is red)
    const alertBox = document.getElementById("ground-alert");
    alertBox.hidden = !evaluation.notify;
    document.getElementById("ground-alert-reason").textContent =
      (evaluation.urgent ? " Contact them now. " : " Report at the next scheduled contact. ") +
      "Readings: " + evaluation.reasons.join("; ") + ".";
  },

  /* Lists every source from thresholds.js in the footer */
  renderSources() {
    const list = document.getElementById("sources-list");
    Object.values(SOURCES).forEach((source) => {
      if (source.url === "") return;   // skip "defined by this app" / "to verify"

      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.url;
      link.textContent = source.name;
      link.target = "_blank";
      link.rel = "noopener";
      item.appendChild(link);
      list.appendChild(item);
    });
  },

  /* Replaces the history with 14 days of SIMULATED check-ins, so the chart
     and colors can be demonstrated. These numbers are invented for the demo.
     They are not real astronaut data. Every entry is marked sample: true. */
  loadSampleData() {
    if (VitalsStore.loadEntries().length > 0 &&
        !window.confirm("Replace the saved check-ins with simulated sample data?")) {
      return;
    }

    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const DAYS = 14;
    const entries = [];

    for (let day = 0; day < DAYS; day++) {
      // wave() gives a smooth up-and-down number between -1 and 1
      const wave = (speed) => Math.sin(day * speed);

      entries.push({
        timestamp: new Date(Date.now() - (DAYS - 1 - day) * MS_PER_DAY).toISOString(),
        sample: true,
        heartRate: Math.round(68 + 6 * wave(0.9) + day * 0.8),
        bpSystolic: Math.round(114 + 5 * wave(0.7) + day * 0.9),
        bpDiastolic: Math.round(74 + 3 * wave(1.1) + day * 0.4),
        glucose: Math.round(96 + 10 * wave(1.3)),
        temperature: Math.round((36.6 + 0.2 * wave(0.8)) * 10) / 10,
        sleep: Math.round((7.5 - day * 0.15 + 0.5 * wave(1.7)) * 2) / 2,
        mood: Math.max(1, Math.min(5, Math.round(4 - day * 0.1 + wave(1.9)))),
        spo2: Math.round(97 + wave(0.6)),
        weight: Math.round((72 - day * 0.1) * 10) / 10,
        exercise: Math.round((125 - day * 2 + 15 * wave(1.5)) / 5) * 5
      });
    }

    VitalsStore.replaceEntries(entries);
    this.refresh();
  }
};

/* Start the app when the HTML is fully loaded */
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
