/*
  AstroVitals - charts.js
  Draws the "Trends Over Time" line chart with Chart.js.

  License: MIT (see LICENSE)
  AI disclosure: drafted with the help of Claude (Anthropic), reviewed by the team.

  External library: Chart.js 4.4.1 (MIT License), loaded from cdnjs in index.html.
  https://www.chartjs.org/

  Needs: thresholds.js loaded before this file.
*/

/* Same colors as in css/style.css (a canvas cannot read CSS classes) */
const CHART_COLORS = {
  line: "#5cc8ff",
  secondLine: "#ffcc33",
  text: "#9aa5c4",
  grid: "#2a3558"
};

const TrendChart = {

  chart: null,   // the Chart.js object, created on first use

  /* Shows a text message instead of the chart (or hides it with "") */
  showMessage(text) {
    const message = document.getElementById("chart-message");
    message.textContent = text;
    message.hidden = text === "";
    document.querySelector(".chart-wrapper").hidden = text !== "";
  },

  /* Short date label for the x axis, e.g. "Nov 14" */
  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  },

  /* Builds the lines to draw for the chosen metric.
     Blood pressure is special: it has two lines. */
  buildDatasets(entries, metricKey) {
    const makeLine = (key, label, color) => ({
      label: label,
      data: entries.map((entry) => (typeof entry[key] === "number" ? entry[key] : null)),
      borderColor: color,
      backgroundColor: color,
      tension: 0.25,     // slightly curved line
      spanGaps: true     // connect the line over days with no value
    });

    if (metricKey === "bloodPressure") {
      return [
        makeLine("bpSystolic", "Systolic (mmHg)", CHART_COLORS.line),
        makeLine("bpDiastolic", "Diastolic (mmHg)", CHART_COLORS.secondLine)
      ];
    }

    const metric = THRESHOLDS[metricKey];
    return [makeLine(metricKey, metric.label + " (" + metric.unit + ")", CHART_COLORS.line)];
  },

  /* Draws (or redraws) the chart for all entries and the chosen metric */
  render(entries, metricKey) {
    // Chart.js comes from the internet. Offline, it will be missing.
    if (typeof Chart === "undefined") {
      this.showMessage("The chart library could not be loaded. Check the internet connection.");
      return;
    }

    const datasets = this.buildDatasets(entries, metricKey);
    const hasValues = datasets.some((set) => set.data.some((value) => value !== null));

    if (!hasValues) {
      this.showMessage("No data for this reading yet. Save a check-in to see the trend.");
      return;
    }
    this.showMessage("");

    const labels = entries.map((entry) => this.formatDate(entry.timestamp));

    // If the chart already exists, only replace its data
    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets = datasets;
      this.chart.update();
      return;
    }

    try {
      const canvas = document.getElementById("trend-chart");
      this.chart = new Chart(canvas, {
        type: "line",
        data: { labels: labels, datasets: datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,   // fill the .chart-wrapper height
          plugins: {
            legend: { labels: { color: CHART_COLORS.text } }
          },
          scales: {
            x: { ticks: { color: CHART_COLORS.text }, grid: { color: CHART_COLORS.grid } },
            y: { ticks: { color: CHART_COLORS.text }, grid: { color: CHART_COLORS.grid } }
          }
        }
      });
    } catch (error) {
      console.warn("AstroVitals: could not draw the chart.", error);
      this.showMessage("The chart could not be drawn in this browser.");
    }
  }
};
