# System Design & End-to-End Simulation Flow

This document details the architectural design and end-to-end simulation pipeline of the **3D Linux Terminal Internals Visualizer**.

---

## 1. High-Level Architecture Overview

The system bridges a standard DOM terminal emulator with a reactive Three.js 3D world, modeling the physical layers of a computer executing Linux system calls.

```
+-------------------------------------------------------------------------+
|                              User Interface                             |
|  +-----------------------+     +-------------------+   +-------------+  |
|  | TerminalUI (DOM xterm)|     | HUD Telemetry     |   | Modals/Quiz |  |
|  +-----------+-----------+     +---------^---------+   +------^------+  |
+--------------|---------------------------|--------------------|---------+
               | Command String            | Telemetry Events   | State
               v                           |                    |
+------------------------------------------+--------------------+---------+
|                         Simulation Core Engine                          |
|  +-------------------------------------------------------------------+  |
|  | CommandEngine (AST tokenization, flag parser, preset resolution)  |  |
|  +-----------------------------------+-------------------------------+  |
|                                      | Execution Plan                   |
|                                      v                                  |
|  +-------------------------------------------------------------------+  |
|  | TimelineRunner (Staged animation scheduler, progress emitter)    |  |
|  +-----------------------------------+-------------------------------+  |
+--------------------------------------|----------------------------------+
                                       | Coordinate & Event Dispatches
                                       v
+-------------------------------------------------------------------------+
|                            Three.js 3D World                            |
|  +-----------------------+     +-------------------+   +-------------+  |
|  | UserSpace Layer (Y=0) | --> | Syscall Gate (Y=-8)|--> | Kernel/VFS  |  |
|  | Process Nodes & C-Lib |     | Register Visuals  |   | Inodes/RAM  |  |
|  +-----------------------+     +-------------------+   +-------------+  |
|  +-------------------------------------------------------------------+  |
|  | DataHighways (3D Cubic Bézier splines) & ParticleSystem           |  |
|  +-------------------------------------------------------------------+  |
+-------------------------------------------------------------------------+
                                       |
                                       v Audio Trigger
+-------------------------------------------------------------------------+
|                        Procedural SoundFX Engine                        |
|  Web Audio API Oscillators, Biquad Filters, and Frequency Modulation    |
+-------------------------------------------------------------------------+
```

---

## 2. Command Lifecycle Stages

Every command entered by the user traverses 5 discrete phases:

### Phase 1: Input Ingestion & Tokenization
- The user inputs a command into `TerminalUI`.
- The raw command string is split into command name, flags, and positional arguments.
- Real-time auto-complete matches against the 1,000-command catalog (`linux100Commands`, `linux400Commands`, `linux500Commands`).

### Phase 2: Plan Compilation (`CommandEngine`)
- `CommandEngine.buildExecutionPlan(cmd, args, flags)` resolves the matching preset in `commandPresets.js`.
- If no custom preset is found, a generic fallback plan is synthesized based on the command category (e.g., File System, Process Control, Networking, System Info).
- The plan includes:
  - **Syscall Sequence**: (e.g., `sys_openat`, `sys_read`, `sys_write`, `sys_close`).
  - **Hardware/Layer Waypoints**: Coordinates in 3D space indicating packet movement.
  - **Memory/VFS Mutations**: Nodes created or modified in `virtualLinuxEnv.js`.

### Phase 3: Timeline Dispatch (`TimelineRunner`)
- `TimelineRunner` orchestrates the sequential step execution using a normalized time delta.
- At each step:
  - Pulses the relevant 3D layer (User Space, Syscall Gateway, Kernel Space, VFS).
  - Emits telemetry metrics to the HUD (CPU ticks, simulated latency, active registers `%rax`, `%rdi`).
  - Triggers procedural audio frequency pulses in `soundFX.js`.

### Phase 4: 3D Visualization & Particle Kinematics
- `DataHighways` illuminates the active Bézier curve connecting the participating layers.
- `ParticleSystem` spawns instanced data packet meshes that travel along the highway spline curves.
- Inode meshes in `layerVFS` flash (green for read, orange for write, red for deletion).

### Phase 5: Output Resolution & Shell Prompt Return
- Virtual filesystem mutations persist in `VirtualLinuxEnv`.
- Output strings stream into the terminal buffer with syntax highlighting.
- The prompt is returned to the user ready for the next command.
