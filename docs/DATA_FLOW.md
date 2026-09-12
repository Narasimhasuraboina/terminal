# Data Flow & Overlay State Synchronization

This guide explains how state and user actions are synchronized between the 2D HTML/DOM interface and the Three.js 3D WebGL scene.

---

## 1. Dual-Layer Architecture

The application operates as a dual-layer system:
1. **DOM Layer (Z-Index 10-100)**: Houses the interactive shell (`terminalUI`), telemetry readouts (`hudOverlay`), architectural schematic (`blueprintOverlay`), mission catalogs (`missionsModal`), and inspection panels (`inspectorModal`).
2. **WebGL Layer (Z-Index 1)**: Renders the 3D multi-tier hardware/kernel layers using Three.js.

```
+-------------------------------------------------------------+
| DOM Overlays (TerminalUI, HUD, Modals, Blueprint)           |  Z: 10-100
+-------------------------------------------------------------+
                              |
                     Event Bus & Callbacks
                              v
+-------------------------------------------------------------+
| Three.js Canvas (SceneManager, CameraManager, Raycasting)   |  Z: 1
+-------------------------------------------------------------+
```

---

## 2. Event Dispatching Flow

### Terminal Execution Event
1. When a user presses `Enter` in `TerminalUI`, it dispatches an execution request:
   ```javascript
   commandEngine.execute(commandString, (event) => {
       timelineRunner.dispatch(event);
   });
   ```
2. `TimelineRunner` notifies `SceneManager` with the target waypoint vectors.
3. `CameraManager` smoothly pans toward the active layer if auto-tracking is enabled.

### 3D Node Raycasting & Inspection
1. When the user hovers or clicks on any 3D node (e.g., Inode cube or Syscall gate):
   - `SceneManager.handlePointerDown()` casts a ray from the camera plane through mouse coordinates.
   - Intersected meshes expose their attached `.userData` object (containing node ID, type, inode number, and permissions).
2. `InspectorModal.populate(userData)` opens the DOM inspector panel, rendering:
   - Node name and path
   - Inode metadata and octal permissions
   - Active system calls interacting with the node
3. The camera enters a localized focus orbit around the selected node until dismissed.

---

## 3. UI State Lifecycle Matrix

| Overlay Component | Trigger / Activation | Camera State | Audio Feedback |
| :--- | :--- | :--- | :--- |
| **TerminalUI** | Always visible (bottom) | Standard orbit | Mechanical key clack |
| **HUD Overlay** | Always visible (top) | Standard orbit | Subtle data pulse |
| **Blueprint Overlay** | `B` key / Button click | Top-down Orthographic | High-frequency hum |
| **Inspector Modal** | 3D Node Click | Focus Zoom & Lock | Low-pass filtered blip |
| **Missions Modal** | `M` key / Button click | Paused Pan | UI menu chime |
| **Quiz Mode** | `Q` key / Button click | Dynamic Orbit | Success/Error chime |
