"use strict";
const { execFileSync } = require("node:child_process");
const run = (cmd, args) => { try { return execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch (e) { return e.stdout || ""; } };

/** Parse "3000", "3000-3005", ":8080", "3000,5173" → sorted unique ports */
function parsePorts(list) {
  const out = new Set();
  for (const tok of [].concat(list).join(",").split(/[,\s]+/).filter(Boolean)) {
    const m = /^:?(\d+)(?:-(\d+))?$/.exec(tok);
    if (!m) throw new Error(`Invalid port: ${tok}`);
    const a = +m[1], b = m[2] ? +m[2] : a;
    if (a < 1 || b > 65535 || b < a) throw new Error(`Invalid port range: ${tok}`);
    if (b - a > 10000) throw new Error(`Range too large: ${tok}`);
    for (let p = a; p <= b; p++) out.add(p);
  }
  return [...out].sort((x, y) => x - y);
}

/** lsof -nP -iTCP -sTCP:LISTEN -FpcnPL  (field output) */
function parseLsof(txt) {
  const rows = []; let pid, cmd, user, proto = "tcp";
  for (const line of txt.split("\n")) {
    const k = line[0], v = line.slice(1);
    if (k === "p") pid = +v; else if (k === "c") cmd = v; else if (k === "L") user = v; else if (k === "P") proto = v.toLowerCase();
    else if (k === "n") { const m = /(?:^|[:\]])(\d+)$/.exec(v.split("->")[0]); if (m) rows.push({ port: +m[1], pid, command: cmd, user, proto, address: v.replace(/:\d+$/, "") || "*" }); }
  }
  return dedupe(rows);
}
/** ss -Hltnp */
function parseSs(txt) {
  const rows = [];
  for (const line of txt.split("\n")) {
    const cols = line.trim().split(/\s+/); if (cols.length < 4) continue;
    const local = cols[3], m = /:(\d+)$/.exec(local); if (!m) continue;
    const users = /users:\(\("([^"]+)",pid=(\d+)/.exec(line);
    rows.push({ port: +m[1], pid: users ? +users[2] : null, command: users ? users[1] : "?", proto: "tcp", address: local.replace(/:\d+$/, "") });
  }
  return dedupe(rows);
}
/** netstat -ano -p tcp (Windows) */
function parseNetstat(txt) {
  const rows = [];
  for (const line of txt.split("\n")) {
    const c = line.trim().split(/\s+/);
    if (c[0] !== "TCP" || !/LISTEN/i.test(c[3] || "")) continue;
    const m = /:(\d+)$/.exec(c[1]); if (m) rows.push({ port: +m[1], pid: +c[4], command: "?", proto: "tcp", address: c[1].replace(/:\d+$/, "") });
  }
  return dedupe(rows);
}
function dedupe(rows) { const seen = new Set(); return rows.filter((r) => { const k = `${r.port}:${r.pid}`; if (seen.has(k)) return false; seen.add(k); return true; }).sort((a, b) => a.port - b.port); }

function listening() {
  if (process.platform === "win32") {
    const rows = parseNetstat(run("netstat", ["-ano", "-p", "tcp"]));
    const names = {}; for (const l of run("tasklist", ["/fo", "csv", "/nh"]).split("\n")) { const m = /^"([^"]+)","(\d+)"/.exec(l); if (m) names[m[2]] = m[1]; }
    return rows.map((r) => ({ ...r, command: names[r.pid] || r.command }));
  }
  const l = run("lsof", ["-nP", "-iTCP", "-sTCP:LISTEN", "-FpcnPL"]);
  if (l.trim()) return parseLsof(l);
  return parseSs(run("ss", ["-Hltnp"]));
}
function kill(pid, { force = false } = {}) {
  if (process.platform === "win32") { run("taskkill", ["/PID", String(pid), "/T", ...(force ? ["/F"] : [])]); return; }
  process.kill(pid, force ? "SIGKILL" : "SIGTERM");
}
const zombie = (pid) => { try { return /^\d+ \(.*\) Z/.test(require("node:fs").readFileSync(`/proc/${pid}/stat`, "utf8")); } catch { return false; } };
const alive = (pid) => { try { process.kill(pid, 0); return !zombie(pid); } catch (e) { return e.code === "EPERM"; } };
async function killAndWait(pid, { force = false, timeout = 3000 } = {}) {
  kill(pid, { force });
  const end = Date.now() + timeout;
  while (Date.now() < end) { if (!alive(pid)) return "killed"; await new Promise((r) => setTimeout(r, 80)); }
  if (!force) { kill(pid, { force: true }); await new Promise((r) => setTimeout(r, 200)); return alive(pid) ? "alive" : "forced"; }
  return "alive";
}
const COMMON = { 3000: "React / Next / Express", 3001: "dev server", 4200: "Angular", 4321: "Astro", 5000: "Flask / Vite preview", 5173: "Vite", 5432: "Postgres", 6379: "Redis", 8000: "Django / FastAPI", 8080: "dev server", 8888: "Jupyter", 9229: "Node inspector", 27017: "MongoDB", 3306: "MySQL", 1420: "Tauri", 8081: "Metro (React Native)", 19000: "Expo", 6006: "Storybook" };
module.exports = { parsePorts, parseLsof, parseSs, parseNetstat, listening, kill, killAndWait, alive, COMMON };
