import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const site = process.argv[2] ?? "http://127.0.0.1:3000";
const pairs = [
  { title: "Frontier models", creators: ["Anthropic", "OpenAI"], file: "frontier-models.png" },
  { title: "Alternative models", creators: ["Meta", "Z AI"], file: "alternative-models.png" },
];
const screenshotDir = "docs/screenshots";

function browser(session, ...args) {
  return execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8", timeout: 30_000, stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function selectCurrentModels(catalog, creators) {
  return creators.map((creator) => {
    const model = catalog.models
      .filter((item) => item.creator === creator &&
        [item.intelligence, item.coding, item.agentic, item.costPerTask].every(Number.isFinite))
      .sort((a, b) => b.intelligence - a.intelligence)[0];
    if (!model) throw new Error(`No model from ${creator} has all four stats; choose another creator.`);
    return model;
  });
}

function capture(pair, models, search) {
  const session = `konaimi-readme-${process.pid}-${pair.file.replace(/\W/g, "")}`;
  try {
    browser(session, "open", site);
    browser(session, "wait", "--text", "Artificial Analysis");
    browser(session, "set", "viewport", "1600", "1250");
    browser(session, "snapshot", "-i");

    browser(session, "dblclick", "button.tab-name");
    browser(session, "fill", ".tab-name-input", pair.title);
    browser(session, "press", "Enter");

    for (const model of models) {
      browser(session, "fill", "#model-search", model.name);
      browser(session, "snapshot", "-s", ".model-results");
      const result = browser(session, "get", "text", "button.model-option:first-child strong");
      if (result !== model.name) throw new Error(`Expected ${model.name}, found ${result}`);
      browser(session, "click", "button.model-option:first-child");
    }

    browser(session, "fill", "#model-search", search);
    browser(session, "snapshot", "-s", ".roster");
    for (const [index, model] of models.entries()) {
      const card = browser(session, "get", "text", `.player-card:nth-child(${index + 1}) h3`);
      if (card.toLowerCase() !== model.name.toLowerCase()) throw new Error(`Missing selected model: ${model.name}`);
    }
    browser(session, "eval", "document.querySelectorAll('nextjs-portal').forEach(node => node.remove())");
    browser(session, "screenshot", join(screenshotDir, pair.file));
  } finally {
    try { browser(session, "close"); } catch {}
  }
}

async function main() {
  const response = await fetch(new URL("/api/models", site));
  if (!response.ok) throw new Error(`Model API returned ${response.status}`);
  const catalog = await response.json();
  if (catalog.source !== "live") throw new Error("Live API data is required; refusing to publish demo scores as real models.");

  const selected = pairs.map((pair) => selectCurrentModels(catalog, pair.creators));
  await mkdir(screenshotDir, { recursive: true });
  pairs.forEach((pair, index) => capture(pair, selected[index], pairs[(index + 1) % pairs.length].creators[0]));

  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  const entries = pairs.map((pair, index) => {
    const names = selected[index].map((model) => model.name).join(" and ");
    return `**${names}**\n\n![Konaimi comparing ${names} with a relative chart and complete model stats](${screenshotDir}/${pair.file})`;
  }).join("\n\n");
  const screenshots = `## Screenshots\n\nThese are snapshots of live [Artificial Analysis](https://artificialanalysis.ai/) data (Intelligence Index v${catalog.indexVersion}, ${date}). Each selected model has values for all four displayed stats; current scores may differ. Confirm the provider's chart-sharing and attribution requirements before publishing this README.\n\n${entries}\n\n`;
  const readme = await readFile("README.md", "utf8");
  if (!/## Screenshots\n[\s\S]*?(?=## Start\n)/.test(readme)) throw new Error("README screenshot section not found.");
  await writeFile("README.md", readme.replace(/## Screenshots\n[\s\S]*?(?=## Start\n)/, screenshots));
  console.log(`Updated README.md and ${pairs.length} screenshots from ${catalog.models.length} live models.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
