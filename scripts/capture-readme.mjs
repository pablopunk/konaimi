import { execFileSync } from "node:child_process";
import { readFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const url = process.argv[2];
if (!url || !/^https?:\/\/localhost(:\d+)?$|^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(url)) {
  throw new Error("Run: npm run screenshots -- http://127.0.0.1:3000");
}

const fixture = JSON.parse(readFileSync(resolve(root, "scripts/readme-catalog.json"), "utf8"));
const session = `konaimi-readme-${process.pid}`;
const capture = (...args) => execFileSync("agent-browser", ["--session", session, ...args], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const output = resolve(root, "docs/screenshots/comparison.png");

try {
  capture("open", "about:blank");
  capture("set", "viewport", "1700", "1400");
  capture("network", "route", "**/api/models", "--body", JSON.stringify(fixture));
  capture("open", url);
  capture("storage", "local", "set", "konaimi:tabs:demo:v1", JSON.stringify({
    tabs: [{ id: "readme", name: "Frontier Four", modelIds: fixture.models.map((model) => model.id) }],
    activeTabId: "readme",
  }));
  capture("reload");
  capture("wait", "--fn", "document.querySelectorAll('.player-card').length === 4");
  const names = JSON.parse(JSON.parse(capture("eval", "JSON.stringify(Array.from(document.querySelectorAll('.player-card h3'), card => card.textContent))")));
  if (names.join("|") !== fixture.models.map((model) => model.name).join("|")) {
    throw new Error(`Unexpected models in screenshot: ${names.join(", ")}`);
  }
  mkdirSync(resolve(root, "docs/screenshots"), { recursive: true });
  capture("screenshot", output);
  console.log(`Saved ${output}`);
} finally {
  try { capture("close"); } catch {}
}
