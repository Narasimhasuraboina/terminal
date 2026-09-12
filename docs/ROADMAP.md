# Product & Technical Roadmap

This document outlines the planned future milestones, architectural upgrades, and experimental initiatives for the **3D Linux Terminal Internals Visualizer**.

---

## 🗺️ Milestone Roadmap

### Phase 1: Advanced Visuals & Custom Shaders (Q3 2026)
- **Custom GLSL Data Highway Shaders**: Replace standard Three.js materials with custom fragment shaders featuring animated energy pulses, chromatic aberration, and volumetric neon glow.
- **Dynamic Heatmaps**: Color-code VFS inodes dynamically based on read/write frequency to visualize I/O hotspots.
- **GPU Instanced Mesh Rendering**: Migrate individual Inode and register meshes to `InstancedMesh` buffers for 10x rendering throughput on low-power devices.

### Phase 2: Memory & Paging Subsystem Layer (Q4 2026)
- **Virtual Memory & Page Table Visualizer**: Add a dedicated vertical layer between User Space and Kernel Space representing the MMU (Memory Management Unit).
- **TLB & Paging Animation**: Visualize virtual-to-physical address translation, page faults, and swap partitions in real time when memory-intensive commands (`free`, `vmstat`, `top`) execute.

### Phase 3: Network Stack & Socket Topology (Q1 2027)
- **TCP/IP 3D Pipeline**: Model the kernel network stack (Socket Buffer `sk_buff`, Netfilter/iptables rules, NIC ring buffer).
- **Interactive Network Commands**: Visualizing `curl`, `ping`, `ss`, and `netstat` as packets leaving the local system bus and crossing an external network gateway.

### Phase 4: WebXR & Immersive Virtual Reality (Q2 2027)
- **WebXR Device API Integration**: Step inside the Linux computer using Meta Quest or Apple Vision Pro headsets.
- **6-DOF Spatial Controllers**: Grab, inspect, and reorganize VFS directory nodes with spatial hand tracking.

### Phase 5: Collaborative Multi-User Classrooms (Q3 2027)
- **WebRTC Collaborative Rooms**: Shared 3D spaces where instructors can guide students through Linux debugging scenarios.
- **Synchronized Camera Teleportation**: Instructors can lock student viewpoints to highlight specific kernel subsystems during lectures.
