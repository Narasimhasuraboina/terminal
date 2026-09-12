# 📖 Linux Terminal 3D Documentation Hub

Welcome to the comprehensive documentation hub for the **3D Linux Terminal Internals Visualizer**.

## Architecture & System Design
- [Architecture Guide](ARCHITECTURE.md): Multi-layer 3D model, Ring 3 / Ring 0 privilege separation, and bus kinematics.
- [System Design & Simulation Flow](SYSTEM_DESIGN.md): End-to-end execution lifecycle, AST tokenization, and pipeline stages.
- [Linux Internals Mapping](LINUX_INTERNALS_MAPPING.md): Mapping real x86-64 kernel subsystems to 3D Three.js geometry.
- [Syscall Dispatcher](SYSCALLS.md): Register layouts, interrupt vectors, and syscall table simulation.
- [Virtual File System](VFS_STRUCTURE.md): Inode models, dentry cache, and Page Cache RAM operations.
- [Data Highways & Splines](PERFORMANCE.md): 3D Bézier spline curves and WebGL performance tuning.

## State Management & UI
- [Data Flow & Overlays](DATA_FLOW.md): Synchronizing DOM overlays, event bus dispatching, and 3D raycasting.
- [Command Catalog Taxonomy](COMMAND_REFERENCE.md): Overview of 1,000 Linux commands across 10 categories.
- [Interactive Audio Engine](AUDIO_ENGINE.md): Procedural Web Audio API sound synthesis.
- [Camera Kinematics](CAMERA_CONTROLS.md): Spherical coordinate navigation and Tween waypoint presets.
- [Practice Sandbox Guide](SANDBOX_GUIDE.md): Layout of practice directory fixtures and scenarios.
- [Quiz Engine Mechanics](QUIZ_SYSTEM.md): Terminal knowledge challenges and scoring algorithms.

## Operations & Engineering
- [Deployment & Hosting Guide](DEPLOYMENT_GUIDE.md): Production hosting via Vercel, static servers, Docker, and Cloudflare.
- [Security & Sandboxing](SECURITY_AND_SANDBOXING.md): Client-side isolation, memory safety, and XSS prevention.
- [Testing Strategy](TESTING_STRATEGY.md): Unit verification, test runner specs, and visual regression testing.
- [Troubleshooting Guide](TROUBLESHOOTING.md): Resolving WebGL context loss, audio autoplay restrictions, and FPS stutter.
- [Product Roadmap](ROADMAP.md): Future milestones including custom GLSL shaders and WebXR VR support.

## Developer & Contributor Guides
- [Keyboard Shortcuts & Hotkeys](KEYBOARD_SHORTCUTS.md): Full controls mapping for power users.
- [Contributing Guide](CONTRIBUTING.md): Workflow, code style, and test instructions.
- [Version Changelog](CHANGELOG.md): Historical releases and planned future features.
