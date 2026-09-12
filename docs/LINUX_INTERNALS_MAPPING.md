# Linux Internals to 3D Visualization Conceptual Mapping

This document provides the educational mapping between real-world Linux kernel internals and their 3D visual representations within the visualizer.

---

## 1. Architectural Ring Hierarchy

In x86-64 Linux, CPU execution privileges are separated into protection rings. The visualizer translates these rings into vertical spatial layers:

| Real Linux Concept | 3D Spatial Plane | Visual Representation | Visualizer Module |
| :--- | :--- | :--- | :--- |
| **Ring 3 (User Space)** | Plane $Y = 0$ | Cyan illuminated platform with shell processes and `glibc` stubs | `src/world/layerUserSpace.js` |
| **Syscall Gateway** | Plane $Y = -8$ | Amber neon gateway with register banks (`%rax`, `%rdi`, `%rsi`) | `src/world/layerSyscall.js` |
| **Ring 0 (Kernel Space)**| Plane $Y = -16$ | Deep crimson platform with subsystem dispatch hubs | `src/world/layerKernel.js` |
| **Virtual File System** | Plane $Y = -24$ | Tree of glowing Inode blocks, Dentry cache rings, Page Cache RAM | `src/world/layerVFS.js` |
| **Hardware / Drivers** | Base $Y = -32$ | Dark metal chassis and persistent block storage cylinders | `src/world/dataHighways.js` |

---

## 2. In-Depth Subsystem Mappings

### 2.1 The Syscall Transition (`syscall` / `sysenter`)
* **In Linux:** An instruction (such as `syscall` on x86-64) triggers a hardware trap that elevates CPU privileges from Ring 3 to Ring 0, saving user registers and jumping to the kernel's `system_call` handler.
* **In the Visualizer:** When a command executes, an energy packet descends from the Cyan User Space layer into the Amber Syscall Gateway. The gateway displays the active syscall number (e.g., `0` for `sys_read`, `1` for `sys_write`, `257` for `sys_openat`).

### 2.2 Virtual File System (VFS) & Inodes
* **In Linux:** The VFS abstracts distinct filesystems (ext4, btrfs, procfs, sysfs). Each file or directory is identified by an Inode containing metadata (owner, permissions, size, block pointers).
* **In the Visualizer:** Files and directories appear as geometric cuboids within a 3D hierarchical tree:
  - **Blue Cubes**: Directories (`dentry` nodes).
  - **Green Cubes**: Regular files.
  - **Yellow Cylinders**: Special device nodes (`/dev/null`, `/dev/urandom`).
  - **Purple Hexagons**: Virtual pseudo-filesystems (`/proc/cpuinfo`, `/sys`).

### 2.3 Page Cache & Buffering
* **In Linux:** Rather than immediately hitting physical disk storage, I/O operations read from and write to pages cached in system RAM. Dirty pages are flushed asynchronously.
* **In the Visualizer:** A pulsing crystalline bank represents the RAM Page Cache. When commands like `cat` or `head` execute, packets hit the RAM cache first with high-speed green particle effects before descending to block storage.
