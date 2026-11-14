/*
  AstroVitals - evaluate.js
  Turns one check-in into: a status for every reading, a status for every
  organ on the body map, one overall status, and a list of suggested actions.

  License: MIT (see LICENSE)
  AI disclosure: drafted with the help of Claude (Anthropic), reviewed by the team.

  Needs: thresholds.js (THRESHOLDS, SOURCES) loaded before this file.

  IMPORTANT: this is decision SUPPORT. It compares numbers with reference
  ranges. It never names a disease and never replaces the medical team.
*/

/* Higher number = more serious. Used to find the "worst" status. */
const STATUS_RANK = { none: 0, green: 1, yellow: 2, red: 3 };

/* The organs drawn on the body map */
const ORGANS = ["brain", "lungs", "heart", "muscles", "bones"];

/* Suggested actions per reading, for yellow and red.
   These are general self-care steps written for this app (re-measure, rest,
   drink, report). They are NOT medical treatment instructions.
   TO VERIFY: review the wording with a medical advisor. */
const GUIDANCE = {
  heartRate: {
    yellow: "Heart rate: rest quietly for 5 minutes and measure again.",
    red:    "Heart rate: rest, measure again in 5 minutes, and report the result to the medical team."
  },
  bpSystolic: {
    yellow: "Blood pressure: sit still for 5 minutes and measure again. Note how you feel (dizzy, headache).",
    red:    "Blood pressure: measure again after 5 minutes of rest and report both readings to the medical team."
  },
  bpDiastolic: {
    yellow: "Blood pressure: sit still for 5 minutes and measure again. Note how you feel (dizzy, headache).",
    red:    "Blood pressure: measure again after 5 minutes of rest and report both readings to the medical team."
  },
  glucose: {
    yellow: "Blood glucose: note when you last ate and measure again later today.",
    red:    "Blood glucose: measure again now and report the result to the medical team."
  },
  temperature: {
    yellow: "Temperature: measure again in 1 hour and drink water.",
    red:    "Temperature: measure again in 30 minutes, rest, and report to the medical team."
  },
  sleep: {
    yellow: "Sleep: plan an earlier rest period today and keep screens and bright light low before sleep.",
    red:    "Sleep: very short sleep affects attention. Tell the crew, avoid risky tasks if possible, and report it."
  },
  mood: {
    yellow: "Mood: take a break, talk with a crewmate, or do an activity you enjoy.",
    red:    "Mood: you do not have to handle this alone. Talk with a crewmate and ask for a private talk with the ground support team."
  },
  spo2: {
    yellow: "Oxygen saturation: warm your hand, keep still, and measure again on another finger.",
    red:    "Oxygen saturation: measure again right away and report to the medical team."
  },
  exercise: {
    yellow: "Exercise: try to complete today's exercise session. It protects bones and muscles in low gravity."
  }
};

const Evaluator = {

  /* Returns the more serious of two statuses */
  worst(a, b) {
    return STATUS_RANK[a] >= STATUS_RANK[b] ? a : b;
  },

  /* Evaluates ONE value.
     Returns null when there is nothing to evaluate (no value entered,
     or the metric has no bands, like body weight). */
  evaluateValue(key, value) {
    const metric = THRESHOLDS[key];
    if (!metric || !metric.bands) return null;
    if (typeof value !== "number" || Number.isNaN(value)) return null;

    // Bands are sorted low -> high; take the first one the value fits in
    const band = metric.bands.find((b) => value < b.below);

    return {
      key: key,
      label: metric.label,
      unit: metric.unit,
      value: value,
      status: band.status,
      text: band.text,
      sourceName: SOURCES[band.source].name,
      urgent: band.urgent === true
    };
  },

  /* Evaluates a whole check-in.
     Returns:
       readings - array of results from evaluateValue (only entered values)
       organs   - { brain: "green", lungs: "none", ... }
       overall  - "none" | "green" | "yellow" | "red"
       guidance - array of suggested actions (text)
       notify   - true if the ground medical team should be told
       urgent   - true if they should be told right away
       reasons  - readings that caused the notification (text) */
  evaluateEntry(entry) {
    const result = {
      readings: [],
      organs: {},
      overall: "none",
      guidance: [],
      notify: false,
      urgent: false,
      reasons: []
    };

    ORGANS.forEach((organ) => { result.organs[organ] = "none"; });

    if (!entry) return result;

    Object.keys(THRESHOLDS).forEach((key) => {
      const reading = this.evaluateValue(key, entry[key]);
      if (!reading) return;

      result.readings.push(reading);
      result.overall = this.worst(result.overall, reading.status);

      // Color every organ this reading belongs to
      THRESHOLDS[key].organs.forEach((organ) => {
        result.organs[organ] = this.worst(result.organs[organ], reading.status);
      });

      // Suggested action (skip duplicates, e.g. the two blood pressure numbers)
      const advice = GUIDANCE[key] && GUIDANCE[key][reading.status];
      if (advice && !result.guidance.includes(advice)) {
        result.guidance.push(advice);
      }

      // Any red reading is reported to the ground team
      if (reading.status === "red") {
        result.notify = true;
        result.reasons.push(reading.label + ": " + reading.value + " " + reading.unit);
        if (reading.urgent) result.urgent = true;
      }
    });

    if (result.overall === "green") {
      result.guidance.push("All entered readings are within their reference ranges. Keep your routine.");
    }

    return result;
  }
};
