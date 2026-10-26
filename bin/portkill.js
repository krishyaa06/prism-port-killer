#!/usr/bin/env node
"use strict";
const { parseArgs } = require("node:util");
const { parsePorts, listening, killAndWait, COMMON } = require("../src");
const { c, header, table, plural } = require("../src/ui");
const pkg = require("../package.json");

const HELP = `${header("portkill", "free up busy ports")}

${c.bold("Usage")}
  portkill                     list every listening port
  portkill 3000                kill whatever is on :3000
  portkill 3000 5173 8080      several at once
  portkill 3000-3010           a range
  portkill --dev               kill common dev-server ports (3000-3010, 5173, 8080…)

${c.bold("Options")}
  -f, --force        SIGKILL immediately (default: SIGTERM, then SIGKILL after 3s)
  -n, --dry-run      show what would be killed
      --json         machine-readable output
  -v, --version / -h, --help`;

const DEV = "3000-3010,4200,4321,5000,5173-5175,8000,8080,8081";
let a;
try { a = parseArgs({ allowPositionals: true, options: { force: { type: "boolean", short: "f" }, "dry-run": { type: "boolean", short: "n" }, dev: { type: "boolean" }, json: { type: "boolean" }, version: { type: "boolean", short: "v" }, help: { type: "boolean", short: "h" } } }); }
catch (e) { console.error(c.red(`✖ ${e.message}`)); process.exit(2); }
const o = a.values;
if (o.help) { console.log(HELP); process.exit(0); }
if (o.version) { console.log(pkg.version); process.exit(0); }

(async () => {
  let ports = null;
  try { if (a.positionals.length || o.dev) ports = parsePorts([...a.positionals, ...(o.dev ? [DEV] : [])]); }
  catch (e) { console.error(c.red(`✖ ${e.message}`)); process.exit(2); }
  const all = listening();

  if (!ports) {
    if (o.json) { console.log(JSON.stringify(all, null, 2)); return; }
    console.log(header("portkill", "listening ports"));
    if (!all.length) { console.log(`\n${c.dim("Nothing is listening. All ports free.")}`); return; }
    console.log("\n" + table(all.map((r) => [c.accent(":" + r.port), r.pid ?? c.dim("?"), c.bold(r.command || "?"), c.dim(r.address), c.gray(COMMON[r.port] || "")]), { head: ["PORT", "PID", "PROCESS", "ADDRESS", "USUALLY"], align: ["r", "r"] }));
    console.log(`\n${c.dim(plural(all.length, "listener"))} · kill one with ${c.cyan("portkill <port>")}`);
    return;
  }

  const hits = all.filter((r) => ports.includes(r.port));
  const results = [];
  if (!o.json) console.log(header("portkill", o["dry-run"] ? "dry run" : ports.length > 6 ? `${ports.length} ports` : ports.map((p) => ":" + p).join(" ")));
  const pids = [...new Set(hits.map((h) => h.pid).filter(Boolean))];
  const status = {};
  for (const pid of pids) {
    if (o["dry-run"]) { status[pid] = "would kill"; continue; }
    try { status[pid] = await killAndWait(pid, { force: o.force }); }
    catch (e) { status[pid] = e.code === "EPERM" ? "permission denied" : e.code === "ESRCH" ? "killed" : e.message; }
  }
  for (const h of hits) results.push({ ...h, status: h.pid ? status[h.pid] : "no pid (try sudo)" });
  const free = ports.filter((p) => !hits.some((h) => h.port === p));
  if (o.json) { console.log(JSON.stringify({ results, free }, null, 2)); process.exit(results.some((r) => /denied|alive|no pid/.test(r.status)) ? 1 : 0); }
  console.log();
  for (const r of results) {
    const ok = /killed|forced|would/.test(r.status);
    console.log(`  ${ok ? c.green("✔") : c.red("✖")} ${c.accent((":" + r.port).padEnd(6))} ${c.bold(r.command || "?")} ${c.dim(`pid ${r.pid ?? "?"}`)}  ${ok ? c.green(r.status) : c.red(r.status)}`);
  }
  if (free.length && free.length <= 12) for (const p of free) console.log(`  ${c.dim("·")} ${c.dim((":" + p).padEnd(6))} ${c.dim("already free")}`);
  else if (free.length) console.log(`  ${c.dim(`· ${free.length} other ports already free`)}`);
  const bad = results.filter((r) => !/killed|forced|would/.test(r.status)).length;
  console.log(`\n${bad ? c.red(`✖ ${plural(bad, "port")} could not be freed`) : c.green(`✔ ${o["dry-run"] ? plural(results.length, "port") + " would be freed" : results.length ? "Freed " + plural(results.length, "port") : "Nothing to kill"}`)}`);
  process.exit(bad ? 1 : 0);
})();
