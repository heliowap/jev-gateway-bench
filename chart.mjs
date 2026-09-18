#!/usr/bin/env node
// Draws the comparison chart: node chart.mjs <results dir> [<results dir> …] [--out charts]
//
// One panel per measure, because tokens, seconds and requests share no scale. Inside a panel every
// agent-and-task pair gets two rows, routing on and routing off: the bar is the median, the dots
// are the individual runs. Showing the runs matters: agents vary a lot, and a median alone would
// hide whether a difference is bigger than the spread. Costs are drawn relative to each pair's own
// baseline median, because one agent can read ten times the tokens of another and a shared absolute
// axis would flatten the smaller one; the absolute medians are printed beside the bars. Written as
// static SVG (GitHub strips scripts), in a light and a dark variant.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const THEMES = {
  light: { surface: "#fcfcfb", ink: "#0b0b0b", ink2: "#52514e", muted: "#898781", grid: "#e1e0d9", axis: "#c3c2b7", on: "#2a78d6", off: "#eb6834" },
  dark: { surface: "#1a1a19", ink: "#ffffff", ink2: "#c3c2b7", muted: "#898781", grid: "#2c2c2a", axis: "#383835", on: "#3987e5", off: "#d95926" },
};
const MODES = [["on", "Jev routing on"], ["off", "Routing off (baseline)"]];
const PANELS = [
  ["Input tokens per run", (run) => run.input, (value) => (value >= 1e6 ? (value / 1e6).toFixed(2) + "M" : Math.round(value / 1e3) + "k")],
  ["Output tokens per run", (run) => run.output, (value) => Math.round(value).toLocaleString("en-US")],
  ["LLM requests per run", (run) => run.requests, (value) => (Number.isInteger(value) ? String(value) : value.toFixed(1))],
  ["Wall-clock seconds per run", (run) => run.seconds, (value) => Math.round(value) + " s"],
  ["Hidden checks passed", (run) => 100 * run.score, (value) => Math.round(value) + "%"],
];

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const escape = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;");
/** A round number at or above `value`, so the axis ends on a tick a person would choose. */
function niceCeiling(value) {
  const magnitude = 10 ** Math.floor(Math.log10(value || 1));
  return [1, 2, 2.5, 5, 10].map((step) => step * magnitude).find((step) => step >= value);
}

const AGENT_NAMES = { codex: "Codex", claude: "Claude Code" };
const groupLabel = (run) => `${AGENT_NAMES[run.agent] ?? run.agent} · ${run.task.replace(/^chess-/, "")}`;

function draw(runs, theme) {
  const c = THEMES[theme];
  const groups = [...new Set(runs.map(groupLabel))];
  const W = 1200;
  const PAD = 32;
  const COLS = 2;
  const GAP = 40;
  const panelW = (W - 2 * PAD - (COLS - 1) * GAP) / COLS;
  const LABEL_W = 150;
  const VALUE_W = 96;
  const ROW_H = 16;
  const GROUP_GAP = 14;
  const plotW = panelW - LABEL_W - VALUE_W;
  const panelH = 34 + groups.length * (2 * ROW_H + GROUP_GAP) + 22;
  const HEADER = 124;
  const rows = Math.ceil((PANELS.length + 1) / COLS);
  const H = HEADER + rows * (panelH + 28) + 40;
  const out = [];
  const text = (x, y, content, { size = 12, fill = c.ink2, anchor = "start", weight = 400 } = {}) =>
    out.push(`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" font-weight="${weight}">${escape(content)}</text>`);

  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" role="img" aria-label="Benchmark results with Jev routing on and off">`);
  out.push(`<rect width="${W}" height="${H}" fill="${c.surface}"/>`);
  text(PAD, 40, "Same task, same agent: Jev routing on vs. off", { size: 20, fill: c.ink, weight: 650 });
  const perCell = Math.min(...groups.flatMap((group) => MODES.map(([mode]) => runs.filter((run) => groupLabel(run) === group && run.mode === mode).length)));
  const models = [...new Set(runs.map((run) => `${AGENT_NAMES[run.agent] ?? run.agent}: ${run.agentModel ?? run.models?.find((model) => !model.includes("review")) ?? "default model"}`))].join(", ");
  text(PAD, 62, `Bars are medians, dots are the individual runs (${perCell} per mode), drawn relative to each pair's baseline median.`, { size: 13 });
  text(PAD, 80, `Lower is better, except for checks passed. ${models}.`, { size: 13 });
  // Legend: always present for two series, in ink; the swatch carries the identity.
  let legendX = PAD;
  for (const [mode, label] of MODES) {
    out.push(`<rect x="${legendX}" y="${94}" width="14" height="8" rx="4" fill="${c[mode]}"/>`);
    text(legendX + 20, 102, label, { size: 12, fill: c.ink2 });
    legendX += 40 + label.length * 6.6;
  }

  PANELS.forEach(([title, measure, format], panelIndex) => {
    const x0 = PAD + (panelIndex % COLS) * (panelW + GAP);
    const y0 = HEADER + Math.floor(panelIndex / COLS) * (panelH + 28);
    const absolute = title.startsWith("Hidden");
    const baseline = (group) => median(runs.filter((run) => groupLabel(run) === group && run.mode === "off").map(measure)) || 1;
    const relative = (run) => (absolute ? measure(run) : (100 * measure(run)) / baseline(groupLabel(run)));
    const max = absolute ? 100 : Math.max(150, niceCeiling(Math.max(...runs.map(relative))));
    const scale = (value) => x0 + LABEL_W + (plotW * value) / max;
    text(x0, y0 + 14, title, { size: 14, fill: c.ink, weight: 600 });
    const top = y0 + 34;
    const bottom = top + groups.length * (2 * ROW_H + GROUP_GAP) - GROUP_GAP;
    for (let value = 0; value <= max; value += absolute ? 25 : 50) {
      const x = scale(value);
      // The baseline's own median is the reference line of a relative panel.
      const reference = value === 0 || (!absolute && value === 100);
      out.push(`<line x1="${x}" y1="${top - 4}" x2="${x}" y2="${bottom + 4}" stroke="${reference ? c.axis : c.grid}" stroke-width="1"/>`);
      text(x, bottom + 18, !absolute && value === 100 ? "baseline" : value + "%", { size: 11, fill: c.muted, anchor: "middle" });
    }
    groups.forEach((group, groupIndex) => {
      const gy = top + groupIndex * (2 * ROW_H + GROUP_GAP);
      text(x0 + LABEL_W - 12, gy + ROW_H + 4, group, { size: 12, fill: c.ink2, anchor: "end" });
      const medians = {};
      MODES.forEach(([mode], modeIndex) => {
        const members = runs.filter((run) => groupLabel(run) === group && run.mode === mode);
        if (!members.length) return;
        const cell = members.map(relative);
        const cy = gy + modeIndex * ROW_H + ROW_H / 2;
        medians[mode] = median(members.map(measure));
        const barEnd = Math.max(scale(median(cell)), scale(0) + 4);
        // Rounded at the data end only; the other end sits square on the baseline.
        out.push(`<path d="M${scale(0)},${cy - 4} H${barEnd - 4} a4,4 0 0 1 0,8 H${scale(0)} Z" fill="${c[mode]}" opacity="0.55"/>`);
        for (const value of cell) out.push(`<circle cx="${scale(value)}" cy="${cy}" r="4" fill="${c[mode]}" stroke="${c.surface}" stroke-width="2"/>`);
      });
      // Direct labels, in ink: both medians, and what routing changed.
      MODES.forEach(([mode], modeIndex) => {
        if (medians[mode] === undefined) return;
        const delta = mode === "on" && medians.off ? Math.round((100 * (medians.on - medians.off)) / medians.off) : undefined;
        const label = format(medians[mode]) + (delta === undefined || delta === 0 ? "" : `  ${delta > 0 ? "+" : ""}${delta}%`);
        text(x0 + LABEL_W + plotW + 10, gy + modeIndex * ROW_H + ROW_H / 2 + 4, label, { size: 11, fill: mode === "on" ? c.ink : c.ink2, weight: mode === "on" ? 600 : 400 });
      });
    });
  });

  // The last cell holds what the panels cannot: how many runs were fully solved, and Jev's own cost.
  const x0 = PAD + (PANELS.length % COLS) * (panelW + GAP);
  const y0 = HEADER + Math.floor(PANELS.length / COLS) * (panelH + 28);
  text(x0, y0 + 14, "Solved runs and what Jev itself cost", { size: 14, fill: c.ink, weight: 600 });
  groups.forEach((group, index) => {
    const y = y0 + 44 + index * 54;
    const cell = (mode) => runs.filter((run) => groupLabel(run) === group && run.mode === mode);
    const solved = (mode) => `${cell(mode).filter((run) => run.solved).length}/${cell(mode).length}`;
    const jevTokens = cell("on").reduce((total, run) => total + run.jevInput, 0);
    const steered = cell("on").reduce((total, run) => total + run.requests - (run.modes.passthrough ?? 0), 0);
    const requests = cell("on").reduce((total, run) => total + run.requests, 0);
    text(x0, y, group, { size: 12, fill: c.ink, weight: 600 });
    text(x0, y + 17, `Solved ${solved("on")} with routing, ${solved("off")} without.`, { size: 12 });
    text(x0, y + 33, `Jev steered ${steered} of ${requests} requests, reading ${Math.round(jevTokens / 1e3)}k tokens ($${((jevTokens * 0.042) / 1e6).toFixed(4)}).`, { size: 12 });
  });
  out.push("</svg>");
  return out.join("\n");
}

const args = process.argv.slice(2);
const outFlag = args.indexOf("--out");
const outDir = outFlag >= 0 ? args[outFlag + 1] : "charts";
const dirs = args.filter((arg, index) => !arg.startsWith("--") && (outFlag < 0 || index !== outFlag + 1));
if (!dirs.length) throw new Error("usage: node chart.mjs <results dir> [<results dir> …] [--out charts]");
const runs = dirs.flatMap((dir) => readFileSync(join(dir, "runs.jsonl"), "utf8").trim().split("\n").map((line) => JSON.parse(line)));
mkdirSync(outDir, { recursive: true });
for (const theme of Object.keys(THEMES)) {
  writeFileSync(join(outDir, `comparison-${theme}.svg`), draw(runs, theme));
  console.log(join(outDir, `comparison-${theme}.svg`));
}
