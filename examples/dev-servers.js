// Starts a few fake "dev servers" so you can try portkill safely.
// usage: node examples/dev-servers.js   (Ctrl+C to stop, or use portkill)
const { fork } = require("node:child_process");
const SERVERS = { vite: 5173, "next-server": 3000, uvicorn: 8000, storybook: 6006 };
if (process.argv[2]) {
  process.title = process.argv[2];
  require("node:http").createServer((_, res) => res.end(process.title)).listen(+process.argv[3]);
} else {
  for (const [name, port] of Object.entries(SERVERS)) fork(__filename, [name, String(port)], { detached: true, stdio: "ignore" }).unref();
  console.log("started:", Object.entries(SERVERS).map(([n, p]) => `${n} :${p}`).join(", "));
  setTimeout(() => process.exit(0), 300);
}
