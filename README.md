# 🐧 3D Linux Terminal Internals Visualizer

An interactive, 3D graphical web application that visualizes what happens under the hood when Linux commands are executed in a terminal.

---

## 🌟 Features

- **Four 3D Architectural Layers**:
  1. **User Space & Shell**: Terminal Emulator (PTY Master), Line Discipline, Shell Lexer, Tokenizer, AST Generator, and `$PATH` Hash Lookup.
  2. **Syscall Gateway**: CPU Privilege Shield (Ring 3 User vs. Ring 0 Kernel), Syscall Dispatcher, `fork()`/`clone()` process replicator, `execve()` binary context switcher, and File Descriptor Table (`0: stdin`, `1: stdout`, `2: stderr`, `pipe` handles).
  3. **Kernel Core & Virtual Memory (MMU)**: Multi-core CPU with live register readouts (`RIP`, `RAX`, `RSP`, `RDI`), Process Scheduler (CFS Red-Black Tree), 4-Level Page Tables, and ELF segment mapping (`.text`, `.rodata`, `.data`, `.bss`, Heap, Stack).
  4. **VFS & Hardware Storage Grid**: Virtual File System Inode tree (`dentry` & `inode`), Kernel Page Cache in RAM, and NVMe/SSD Block I/O DMA data buses.

- **Real-Time Data Highways**:
  - Glowing 3D Bézier splines connecting subsystems.
  - Flowing photon data packets and particle burst animations representing data and control flow.

- **Interactive Cyber Terminal**:
  - Live interactive command line with syntax highlighting, command history, and custom command evaluation.
  - Pre-built rich scenarios:
    - `ls -la` (Directory Inodes, `openat`, `getdents64`, formatting stdout)
    - `cat file.txt` (Page Cache RAM lookup, NVMe Block DMA read, `read`/`write` buffers)
    - `grep "WARN" log | wc -l` (Unix pipelines, `pipe()`, dual `fork()`, `dup2()` descriptor rewiring)
    - `mkdir my_project` (Ext4 Inode allocation, directory dentry creation, JBD2 journal commit)
    - `kill -9 1337` (Kernel signal table delivery, non-catchable SIGKILL, resource reaping)
    - Any custom command entered by the user!

- **Interactive Controls & Inspector**:
  - **Timeline Controller**: Play, Pause, Step Forward/Backward, Scrub, Speed multiplier (0.5x, 1x, 2x).
  - **Cinematic & Orbital Camera**: Preset waypoints (Overview, User Space, Syscall, Kernel, Storage) + Free Orbit/Pan/Zoom.
  - **Holographic Inspector Modal**: Click any 3D node to view real Linux kernel C code structs (`struct task_struct`, `struct inode`, `struct page`), explanations, and x86-64 assembly instructions (`syscall`, `mov rax, 59`).
  - **Procedural Web Audio FX**: Digital keystroke clicks, syscall warp hums, fork booms, and completion chimes.
  - **Linux Internals Quiz**: Interactive challenge mode testing system call and architecture knowledge with confetti celebration!

---

## 🚀 Getting Started

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Preview
```bash
npm run build
npm run preview
```
Or serve the `dist/` directory with any static server:
```bash
python3 -m http.server 3000 --directory dist
```

---

## 🛠 Tech Stack
- **Three.js**: WebGL 3D scene rendering, lighting, materials, and raycasting.
- **@tweenjs/tween.js**: Smooth camera waypoint transitions and animations.
- **Web Audio API**: Procedurally synthesized sci-fi sound effects (zero external audio files).
- **Canvas Confetti**: Celebratory particle effects for quiz rewards.
- **Vite**: Blazing-fast development and optimized production bundling.
