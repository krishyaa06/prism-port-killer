<!-- ═════════════ HEADER ═════════════ -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:07060f,50:FF8A3D,100:FF5E7E&height=200&section=header&text=Prism%20Port%20Killer&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Free%20busy%20ports%20in%20one%20command&descAlignY=58&descSize=16" width="100%" alt="Prism Port Killer" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=19&duration=2600&pause=800&color=FF8A3D&center=true&vCenter=true&width=680&lines=portkill+3000;Error%3A+EADDRINUSE+%3A%3A%3A3000;portkill+--dev;Port+freed.+Ship+it." alt="Typing SVG" />
</p>

<p align="center">
  <a href="https://github.com/krishyaa06/prism-port-killer/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/krishyaa06/prism-port-killer/ci.yml?branch=main&style=for-the-badge&label=CI&logo=githubactions&logoColor=white" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A518.17-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/dependencies-0-FF8A3D?style=for-the-badge" alt="Zero dependencies" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/krishyaa06/prism-port-killer?style=for-the-badge&color=FF5E7E" alt="License" /></a>
</p>

<p align="center">
  <img src="assets/screenshots/demo.png" width="90%" alt="Prism Port Killer screenshot" />
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%" />

## ⚡ Overview

**Prism Port Killer** (`portkill`) fixes the most annoying error in web dev: `EADDRINUSE: address already in use :::3000`. Run it with no arguments to see every listening port with its process and what usually runs there, or pass ports / ranges to free them. It sends `SIGTERM` first so servers can shut down cleanly, then `SIGKILL` if they don't exit within 3 seconds.

## ✨ Features

- `portkill` lists every listening TCP port with PID, process name and a hint (Vite, Next, Postgres…)
- Kill by port, several ports, or ranges: `portkill 3000 5173 8000-8010`
- `--dev` preset frees all common dev-server ports at once
- Graceful: `SIGTERM` → wait → `SIGKILL`; `--force` to kill immediately
- `--dry-run` and `--json`; exit code 1 if a port could not be freed
- Works on **macOS / Linux** (lsof or ss) and **Windows** (netstat + taskkill). Zero dependencies

## 🚀 Quick Start

```bash
# run without installing
npx github:krishyaa06/prism-port-killer 3000

# or install globally
npm install -g github:krishyaa06/prism-port-killer
portkill --dev
```

Requires Node.js 18.17+. No dependencies.

## 🛠️ Usage

```text
portkill                     list every listening port
portkill 3000                kill whatever is on :3000
portkill 3000 5173 8080      several at once
portkill 3000-3010           a range
portkill --dev               kill common dev-server ports

  -f, --force      SIGKILL immediately
  -n, --dry-run    show what would be killed
      --json       machine-readable output
```

### Try it safely

```bash
node examples/dev-servers.js   # starts fake vite / next / uvicorn / storybook servers
portkill                       # see them
portkill --dev 6006            # free them all
```

### Add it to your scripts

```json
"scripts": { "predev": "npx --yes github:krishyaa06/prism-port-killer 3000" }
```

> Ports owned by another user (e.g. system services) need `sudo`.

## 📁 Project Structure

```
prism-port-killer/
├── assets/
│   ├── logo.png
│   └── logo.svg
├── bin/
│   └── portkill.js   # CLI entry
├── examples/
│   └── dev-servers.js   # fake servers to try it on
├── src/
│   ├── index.js   # port discovery + kill
│   └── ui.js   # colours, tables
├── test/
│   └── portkill.test.js
├── .gitignore
├── LICENSE
└── package.json
```

## 🧪 Tests

```bash
npm test
```

Tests use the built-in `node:test` runner, so there is nothing to install. CI runs them on Node 20 and 22.

## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feature/my-idea`
2. Make your change and add a test in `test/`
3. Run `npm test` and open a Pull Request

## 🔷 Part of Prism Protocol

Prism Port Killer is one of the open-source tools built by [Prism Protocol](https://dc.gg/prismprotocol), a tech community where young builders learn, ship and compete together.

## 👤 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/krishyaa06"><img src="https://github.com/krishyaa06.png" width="90" style="border-radius:50%" /><br><b>Soumya Bhandare</b></a><br>
      <sub>Founder @ Prism Protocol</sub>
    </td>
    <td>
      <a href="https://dc.gg/prismprotocol"><img src="https://img.shields.io/badge/Discord-Prism%20Protocol-5865F2?style=for-the-badge&logo=discord&logoColor=white" /></a><br>
      <a href="https://instagram.com/prism_protocol_"><img src="https://img.shields.io/badge/Instagram-@prism__protocol__-E4405F?style=for-the-badge&logo=instagram&logoColor=white" /></a><br>
      <a href="https://x.com/krishyaa06"><img src="https://img.shields.io/badge/X-@krishyaa06-000000?style=for-the-badge&logo=x&logoColor=white" /></a>
    </td>
  </tr>
</table>

## 📄 License

Released under the [MIT License](LICENSE).

<p align="center">
  <b>If you like this project, consider giving it a ⭐</b><br>
  <sub>"Build. Create. Compete." · Made with ⚡ by Prism Protocol</sub>
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF5E7E,50:FF8A3D,100:07060f&height=110&section=footer" width="100%" />
