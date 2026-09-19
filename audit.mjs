// Did a run look at anything it should not have? A benchmark of agents has one obvious way to
// cheat: an earlier run's workspace, a scratch file another run left behind, or this repository's
// reference solution. Each agent keeps a record of what it did; this reads it back and lists every
// path outside the run's own sandbox, and whether the run created that path itself or found it.
import { existsSync, readFileSync } from "node:fs";

// Places an agent may touch without it meaning anything: the toolchain and the system.
const HARMLESS = /^\/(usr|bin|etc|dev|proc|lib|opt|nix|snap)\b|\/\.nvm\/|\/node_modules\/|^\/home\/[^/]+\/\.(npm|cache|nvm|codex|claude)\b/;
const PATHS = /(?<![\w.:-])(~?\/(?:home|tmp|mnt|root|var|Users)\/[^\s"'`\\)<>|;,]*)/g;

function inspect(commands, sandbox) {
  const seen = new Map();
  for (const { tool, text } of commands) {
    for (const [path] of text.matchAll(PATHS)) {
      if (path.startsWith(sandbox) || HARMLESS.test(path) || seen.has(path)) continue;
      const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const created = tool === "Write" || new RegExp(`(>|tee\\s+(-a\\s+)?|mkdir\\s+(-p\\s+)?|touch\\s+)\\s*${escaped}`).test(text);
      seen.set(path, created ? "created" : "found");
    }
  }
  const outside = [...seen].map(([path, how]) => ({ path, how }));
  return { outside, foreignReads: outside.filter((entry) => entry.how === "found").map((entry) => entry.path) };
}

/** Codex prints every command it runs into its own output. */
function codexCommands(agentLog) {
  const lines = readFileSync(agentLog, "utf8").split("\n");
  return lines.filter((line) => /^\/bin\/(ba)?sh -lc /.test(line)).map((text) => ({ tool: "shell", text }));
}

/** Claude Code, run with --output-format stream-json, prints every message, tool calls included. */
function claudeCommands(agentLog) {
  const commands = [];
  for (const line of readFileSync(agentLog, "utf8").split("\n")) {
    try {
      const content = JSON.parse(line).message?.content;
      for (const block of Array.isArray(content) ? content : []) {
        if (block.type === "tool_use") commands.push({ tool: block.name, text: JSON.stringify(block.input) });
      }
    } catch {
      // Not a JSON line.
    }
  }
  return commands;
}

export function audit({ agent, agentLog, sandbox }) {
  if (!existsSync(agentLog)) return { audited: false };
  const commands = agent === "codex" ? codexCommands(agentLog) : agent === "claude" ? claudeCommands(agentLog) : [];
  return { audited: true, toolCalls: commands.length, ...inspect(commands, sandbox) };
}
