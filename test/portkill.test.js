const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");
const { parsePorts, parseLsof, parseSs, parseNetstat } = require("../src");
const bin = path.join(__dirname, "../bin/portkill.js");

test("parsePorts", () => {
  assert.deepEqual(parsePorts(["3000", ":8080", "5173,3000"]), [3000, 5173, 8080]);
  assert.deepEqual(parsePorts("3000-3003"), [3000, 3001, 3002, 3003]);
  assert.throws(() => parsePorts("abc")); assert.throws(() => parsePorts("70000")); assert.throws(() => parsePorts("10-5"));
});
test("parseLsof", () => {
  const r = parseLsof("p123\ncnode\nLsoumya\nPTCP\nn*:3000\nn[::1]:3000\np456\ncpython3\nPTCP\nn127.0.0.1:8000\n");
  assert.deepEqual(r.map((x) => [x.port, x.pid, x.command]), [[3000, 123, "node"], [8000, 456, "python3"]]);
});
test("parseSs", () => {
  const r = parseSs('LISTEN 0 511 0.0.0.0:5173 0.0.0.0:* users:(("node",pid=999,fd=20))\nLISTEN 0 128 [::]:22 [::]:*\n');
  assert.deepEqual(r.map((x) => [x.port, x.pid, x.command]), [[22, null, "?"], [5173, 999, "node"]]);
});
test("parseNetstat (windows)", () => {
  const r = parseNetstat("  Proto  Local Address  Foreign Address  State  PID\n  TCP    0.0.0.0:3000   0.0.0.0:0   LISTENING   4321\n  TCP  127.0.0.1:5000  127.0.0.1:6000  ESTABLISHED 1\n");
  assert.deepEqual(r.map((x) => [x.port, x.pid]), [[3000, 4321]]);
});
test("bad args exit 2", () => { assert.equal(spawnSync("node", [bin, "nope"]).status, 2); });
test("kills a real server", { skip: process.platform === "win32" }, async () => {
  const srv = spawn(process.execPath, ["-e", "const s=require('http').createServer();s.listen(0,()=>process.stdout.write(String(s.address().port)))"], { stdio: ["ignore", "pipe", "ignore"] });
  const port = await new Promise((r) => srv.stdout.once("data", (d) => r(+d)));
  const exited = new Promise((r) => srv.once("exit", r));
  const res = spawnSync("node", [bin, String(port)], { encoding: "utf8" });
  assert.equal(res.status, 0, res.stdout); assert.match(res.stdout, /Freed 1 port/);
  await exited;
});
