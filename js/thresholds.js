/*
  AstroVitals - thresholds.js
  All reference ranges used by the app live in this ONE file.

  License: MIT (see LICENSE)
  AI disclosure: drafted with the help of Claude (Anthropic), reviewed by the team.

  IMPORTANT
  - These ranges are general adult reference values from public health sources.
    They support self-assessment only. They are NOT a diagnosis.
  - Every band below names its source. Bands marked "TO VERIFY" are our own
    working values with no source yet - check them with a medical advisor
    before relying on them.
  - Ranges measured on Earth may not fit spaceflight perfectly. That is a
    known limitation and should be said in the demo.

  HOW A METRIC IS DESCRIBED
    label   - text shown in the interface
    unit    - unit shown next to the value
    organs  - which organs of the body map this reading colors
    bands   - list sorted from LOW to HIGH. A value belongs to the FIRST band
              where:  value < band.below
              The last band always has below: Infinity (catches everything else).
      status  - "green" | "yellow" | "red"
      text    - short explanation shown to the user
      source  - key from SOURCES, or "TO_VERIFY"
      urgent  - optional; true = tell the ground medical team right away
*/

/* ---------- Sources (cited in the README too) ---------- */
const SOURCES = {
  AHA_HR: {
    name: "American Heart Association - resting heart rate (60-100 bpm; athletes 40-60)",
    url: "https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse"
    // TO VERIFY: open this URL and confirm it is the right AHA page
  },
  AHA_BP: {
    name: "American Heart Association - Understanding Blood Pressure Readings",
    url: "https://www.heart.org/bplevels"
  },
  AHA_LOW_BP: {
    name: "American Heart Association - Low Blood Pressure (less than 90/60 mm Hg)",
    url: "https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/low-blood-pressure-when-blood-pressure-is-too-low"
  },
  ADA_HYPO: {
    name: "American Diabetes Association, Standards of Care - classification of hypoglycemia (Level 1: <70, Level 2: <54 mg/dL)",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6969656/table/T6_4"
  },
  ADA_DIAG: {
    name: "American Diabetes Association, Standards of Care - diagnostic criteria (2-h glucose 140-199 mg/dL = prediabetes range, >=200 = diabetes range)",
    url: "https://diabetesjournals.org/care/issue/47/Supplement_1"
    // TO VERIFY: link goes to the 2024 Standards of Care issue; find the exact table
  },
  MEDLINE_TEMP: {
    name: "MedlinePlus (U.S. National Library of Medicine) - Body temperature norms (36.1-37.2 C normal; over 38 C usually fever)",
    url: "https://medlineplus.gov/ency/article/001982.htm"
  },
  NCBI_TEMP: {
    name: "Clinical Methods, NCBI Bookshelf - Temperature (hypothermia: 35 C or less)",
    url: "https://www.ncbi.nlm.nih.gov/books/NBK331/"
  },
  CDC_SLEEP: {
    name: "CDC MMWR 2016 - adults 18-60 are recommended to sleep at least 7 hours",
    url: "https://www.cdc.gov/mmwr/volumes/65/wr/pdfs/mm6506a1.pdf"
  },
  MAYO_SPO2: {
    name: "Mayo Clinic - Hypoxemia (pulse oximeter 95-100% healthy; under 90% low)",
    url: "https://www.mayoclinic.org/symptoms/hypoxemia/basics/definition/sym-20050930"
  },
  NASA_EXERCISE: {
    name: "NASA - Astronaut Exercise (station crews average two hours of exercise per day)",
    url: "https://www.nasa.gov/missions/station/iss-research/astronaut-exercise/"
  },
  APP_DEFINED: {
    name: "Defined by this app - not a clinical standard",
    url: ""
  },
  TO_VERIFY: {
    name: "TO VERIFY - working value, no source yet",
    url: ""
  }
};

/* ---------- Thresholds ---------- */
const THRESHOLDS = {

  /* Resting heart rate, beats per minute */
  heartRate: {
    label: "Heart rate",
    unit: "bpm",
    organs: ["heart"],
    bands: [
      { below: 40,       status: "red",    text: "Very low resting heart rate.",                          source: "TO_VERIFY" }, // TO VERIFY: red limit of 40 is our choice
      { below: 60,       status: "yellow", text: "Below 60 bpm. Can be normal for very fit people.",      source: "AHA_HR" },    // AHA: athletes may rest at 40-60
      { below: 101,      status: "green",  text: "Within the normal resting range (60-100 bpm).",         source: "AHA_HR" },    // AHA: 60-100 normal for adults
      { below: 121,      status: "yellow", text: "Above 100 bpm at rest.",                                source: "AHA_HR" },    // above the AHA normal range
      { below: Infinity, status: "red",    text: "Much higher than the normal resting range.",            source: "TO_VERIFY" }  // TO VERIFY: red limit of 120 is our choice
    ]
  },

  /* Blood pressure - systolic (top number), mm Hg.
     AHA categories: normal <120, elevated 120-129, stage 1 130-139,
     stage 2 >=140, hypertensive crisis >180. Low: <90. */
  bpSystolic: {
    label: "Blood pressure (systolic)",
    unit: "mmHg",
    organs: ["heart"],
    bands: [
      { below: 90,       status: "yellow", text: "Low blood pressure (systolic under 90).",               source: "AHA_LOW_BP" },
      { below: 120,      status: "green",  text: "Normal (under 120).",                                   source: "AHA_BP" },
      { below: 140,      status: "yellow", text: "Elevated or stage 1 range (120-139).",                  source: "AHA_BP" },
      { below: 181,      status: "red",    text: "Stage 2 range (140 or higher).",                        source: "AHA_BP" },
      { below: Infinity, status: "red",    text: "Higher than 180. Re-check, then contact the medical team now.", source: "AHA_BP", urgent: true }
    ]
  },

  /* Blood pressure - diastolic (bottom number), mm Hg.
     AHA categories: normal <80, stage 1 80-89, stage 2 >=90,
     hypertensive crisis >120. Low: <60. */
  bpDiastolic: {
    label: "Blood pressure (diastolic)",
    unit: "mmHg",
    organs: ["heart"],
    bands: [
      { below: 60,       status: "yellow", text: "Low blood pressure (diastolic under 60).",              source: "AHA_LOW_BP" },
      { below: 80,       status: "green",  text: "Normal (under 80).",                                    source: "AHA_BP" },
      { below: 90,       status: "yellow", text: "Stage 1 range (80-89).",                                source: "AHA_BP" },
      { below: 121,      status: "red",    text: "Stage 2 range (90 or higher).",                         source: "AHA_BP" },
      { below: Infinity, status: "red",    text: "Higher than 120. Re-check, then contact the medical team now.", source: "AHA_BP", urgent: true }
    ]
  },

  /* Blood glucose, mg/dL.
     The form does not ask whether the reading is fasting or after a meal,
     so the high side uses the after-meal (2-hour) limits.
     TO VERIFY: this simplification - consider adding a "fasting?" checkbox. */
  glucose: {
    label: "Blood glucose",
    unit: "mg/dL",
    organs: [],
    bands: [
      { below: 54,       status: "red",    text: "Very low glucose (under 54). Eat fast-acting carbohydrate and contact the medical team.", source: "ADA_HYPO", urgent: true }, // ADA Level 2
      { below: 70,       status: "yellow", text: "Low glucose (54-69).",                                  source: "ADA_HYPO" },  // ADA Level 1
      { below: 140,      status: "green",  text: "Within the expected range.",                            source: "ADA_DIAG" },
      { below: 200,      status: "yellow", text: "Higher than expected (140-199).",                       source: "ADA_DIAG" },
      { below: Infinity, status: "red",    text: "High glucose (200 or higher).",                         source: "ADA_DIAG" }
    ]
  },

  /* Body temperature, degrees Celsius */
  temperature: {
    label: "Body temperature",
    unit: "°C",
    organs: [],
    bands: [
      { below: 35.0,     status: "red",    text: "Under 35.0 °C (hypothermia range).",                    source: "NCBI_TEMP", urgent: true },
      { below: 36.1,     status: "yellow", text: "Slightly below the usual range.",                       source: "MEDLINE_TEMP" },
      { below: 37.3,     status: "green",  text: "Within the usual range (36.1-37.2 °C).",                source: "MEDLINE_TEMP" },
      { below: 38.0,     status: "yellow", text: "Slightly raised temperature.",                          source: "MEDLINE_TEMP" },
      { below: Infinity, status: "red",    text: "38.0 °C or higher (fever range).",                      source: "MEDLINE_TEMP" }
    ]
  },

  /* Sleep in the last night, hours.
     Context for the demo: station crews are scheduled 8.5 h of sleep but
     averaged about 6 h in a large study (Barger et al., Lancet Neurology, 2014). */
  sleep: {
    label: "Sleep",
    unit: "h",
    organs: ["brain"],
    bands: [
      { below: 5,        status: "red",    text: "Very short sleep.",                                     source: "TO_VERIFY" }, // TO VERIFY: red limit of 5 h is our choice
      { below: 7,        status: "yellow", text: "Less than the recommended 7 hours.",                    source: "CDC_SLEEP" },
      { below: Infinity, status: "green",  text: "7 hours or more.",                                      source: "CDC_SLEEP" }
    ]
  },

  /* Mood, self-rated 1 (very low) to 5 (very good).
     This is a simple self-report scale made for this app. It is NOT a
     clinical test - it only helps notice a trend (Isolation & confinement). */
  mood: {
    label: "Mood",
    unit: "/5",
    organs: ["brain"],
    bands: [
      { below: 2,        status: "red",    text: "Very low mood reported.",                               source: "APP_DEFINED" },
      { below: 4,        status: "yellow", text: "Lower mood reported.",                                  source: "APP_DEFINED" },
      { below: Infinity, status: "green",  text: "Good mood reported.",                                   source: "APP_DEFINED" }
    ]
  },

  /* Oxygen saturation from a pulse oximeter, percent (optional) */
  spo2: {
    label: "Oxygen saturation (SpO₂)",
    unit: "%",
    organs: ["lungs"],
    bands: [
      { below: 90,       status: "red",    text: "Under 90% (low).",                                      source: "MAYO_SPO2", urgent: true },
      { below: 95,       status: "yellow", text: "Below the healthy range (90-94%).",                     source: "MAYO_SPO2" },
      { below: Infinity, status: "green",  text: "Healthy range (95-100%).",                              source: "MAYO_SPO2" }
    ]
  },

  /* Exercise today, minutes (optional).
     Exercise is the main countermeasure against bone and muscle loss in
     microgravity (Gravity fields hazard). No red band: a missed workout is
     a reminder, not an emergency. */
  exercise: {
    label: "Exercise",
    unit: "min",
    organs: ["bones", "muscles"],
    bands: [
      { below: 120,      status: "yellow", text: "Less than the usual 2 hours of daily exercise.",        source: "NASA_EXERCISE" },
      { below: Infinity, status: "green",  text: "2 hours or more of exercise.",                          source: "NASA_EXERCISE" }
    ]
  },

  /* Body weight, kg (optional).
     There is no fixed "normal" weight for everyone, so no bands here.
     The value is saved and shown on the chart as a trend only.
     TO VERIFY: what % change from the person's baseline should give a warning. */
  weight: {
    label: "Body weight",
    unit: "kg",
    organs: ["muscles"],
    bands: null
  }
};
