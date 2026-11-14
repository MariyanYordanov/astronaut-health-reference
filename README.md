# AstroVitals - Astronaut Health Self-Check

Reference implementation for the NASA Space Apps Challenge 2026 challenge
**"Create Health Monitoring Software for Astronauts on Space Missions"**.

AstroVitals is a small web app in which an astronaut enters daily health
readings, sees at a glance whether they are inside reference ranges
(green / yellow / red), follows them over time, and is told when to notify the
medical team on Earth.

> **AstroVitals supports self-assessment only. It does not diagnose any
> condition and does not replace the mission medical team.**

## How to run

No build step and nothing to install.

- Open `index.html` in a browser, **or**
- publish the repository with GitHub Pages.

An internet connection is needed only for the chart library (Chart.js from
cdnjs). Without it everything else still works.

## Features

- **Clickable body map** - an SVG figure with brain, lungs, heart, muscles and
  bones. Each organ is colored by the status of its readings; clicking it shows
  the readings and the related spaceflight hazard.
- **Daily check-in form** - heart rate, blood pressure, blood glucose, body
  temperature, sleep, mood; optional SpO2, body weight, exercise minutes.
- **Status panel** - one row per reading, an overall status, suggested actions,
  and a "Notify ground medical team" alert when a reading is red.
- **Trends chart** - any reading over time.
- **Local data** - check-ins are stored only in the browser (`localStorage`).
- **Sample data** - a button loads 14 days of clearly labelled *simulated*
  check-ins for demonstrations. They are invented, not real astronaut data.

## The five hazards (RIDGE)

The app is organised around the five hazards of human spaceflight described by
the NASA Human Research Program.

| Hazard | Where it appears in the app |
| --- | --- |
| Radiation | Not measured in this version (no reading for it) |
| Isolation & confinement | Mood and sleep (brain) |
| Distance from Earth | The app tells the astronaut when to contact the ground medical team |
| Gravity fields | Exercise minutes (bones, muscles); heart rate and blood pressure (heart) |
| Hostile closed environment | Oxygen saturation (lungs) |

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure and the SVG figure |
| `css/style.css` | Styles |
| `js/thresholds.js` | All reference ranges, each with its source |
| `js/storage.js` | Saving and loading with `localStorage` |
| `js/evaluate.js` | Turns a check-in into statuses and suggested actions |
| `js/body-map.js` | Interactive body map |
| `js/charts.js` | Trends chart |
| `js/app.js` | Connects everything |

## NASA resources used

- NASA Human Research Program - the five hazards of human spaceflight (the
  structure of the app).
- NASA, "Astronaut Exercise" - station crews average two hours of exercise per
  day (the exercise threshold).
  <https://www.nasa.gov/missions/station/iss-research/astronaut-exercise/>
- NASA, "Counteracting Bone and Muscle Loss in Microgravity" (bone and muscle
  explanations).
  <https://www.nasa.gov/missions/station/iss-research/counteracting-bone-and-muscle-loss-in-microgravity/>

## Sources for the reference ranges

General adult reference values from public health sources. They were defined on
Earth and may not fit spaceflight exactly.

- American Heart Association - Understanding Blood Pressure Readings.
  <https://www.heart.org/bplevels>
- American Heart Association - Low Blood Pressure.
  <https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/low-blood-pressure-when-blood-pressure-is-too-low>
- American Heart Association - resting heart rate (60-100 bpm).
- American Diabetes Association, Standards of Care in Diabetes - classification
  of hypoglycemia and diagnostic glucose criteria.
  <https://pmc.ncbi.nlm.nih.gov/articles/PMC6969656/table/T6_4>
- MedlinePlus (U.S. National Library of Medicine) - Body temperature norms.
  <https://medlineplus.gov/ency/article/001982.htm>
- Clinical Methods (NCBI Bookshelf) - Temperature.
  <https://www.ncbi.nlm.nih.gov/books/NBK331/>
- CDC, MMWR 2016 - Prevalence of Healthy Sleep Duration among Adults.
  <https://www.cdc.gov/mmwr/volumes/65/wr/pdfs/mm6506a1.pdf>
- Mayo Clinic - Hypoxemia (low blood oxygen).
  <https://www.mayoclinic.org/symptoms/hypoxemia/basics/definition/sym-20050930>

## Known limitations (TO VERIFY)

These are marked `TO VERIFY` in the code and need a check by a medical advisor:

- The red limits for heart rate (under 40, over 120 bpm) and for sleep (under
  5 hours) are working values chosen for this app, without a source.
- The form does not ask whether blood glucose was measured fasting, so the high
  side uses the after-meal limits (140 and 200 mg/dL).
- The mood scale (1-5) is a simple self-report made for this app, not a clinical
  test.
- Body weight has no reference range; it is shown as a trend only.
- The wording of the suggested actions was written for this app.
- Two source links in `js/thresholds.js` (AHA heart rate page, ADA diagnostic
  table) still need to be opened and confirmed.

## External libraries

- [Chart.js](https://www.chartjs.org/) 4.4.1 - MIT License - loaded from cdnjs.

No other external code, images or fonts are used. The SVG figure was drawn for
this project.

## Use of AI

Parts of the code, comments and this README were drafted with the help of
Claude (Anthropic) and reviewed by the author. No AI-generated images, video or
audio are used. Every source file carries the same note in its header comment.

## License

MIT - see `LICENSE`.
