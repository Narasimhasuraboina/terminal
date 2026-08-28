import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export class CameraManager {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Camera target (lookAt point)
    this.target = new THREE.Vector3(0, 5, 0);

    // Orbit state
    this.isDragging = false;
    this.isPanning = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.spherical = new THREE.Spherical();
    this.spherical.setFromVector3(this.camera.position.clone().sub(this.target));

    this.minDistance = 8;
    this.maxDistance = 180;
    this.minPolarAngle = 0.1;
    this.maxPolarAngle = Math.PI / 2 + 0.05;

    // Architectural Layer Presets
    this.presets = {
      overview: {
        pos: new THREE.Vector3(0, 42, 75),
        target: new THREE.Vector3(0, 4, 0),
        name: 'Full Motherboard'
      },
      userspace: {
        pos: new THREE.Vector3(-38, 14, 28),
        target: new THREE.Vector3(-38, 4.5, 10),
        name: 'Terminal & Shell'
      },
      syscall: {
        pos: new THREE.Vector3(-10, 12, 22),
        target: new THREE.Vector3(-10, 5, 2),
        name: 'Syscall Security Gate'
      },
      kernel: {
        pos: new THREE.Vector3(16, 14, 18),
        target: new THREE.Vector3(16, 4, -2),
        name: 'CPU & RAM Memory'
      },
      vfs: {
        pos: new THREE.Vector3(42, 14, 26),
        target: new THREE.Vector3(42, 4, 12),
        name: 'NVMe SSD Storage'
      }
    };

    // Close-Up Node Specific Target Views (Dynamic Zoom-In)
    this.nodeZoomViews = {
      terminal: {
        pos: new THREE.Vector3(-41, 7.5, 23),
        target: new THREE.Vector3(-41, 4.8, 10)
      },
      lexer: {
        pos: new THREE.Vector3(-32, 8.0, 22),
        target: new THREE.Vector3(-32, 5.0, 10)
      },
      path: {
        pos: new THREE.Vector3(-32, 8.0, 22),
        target: new THREE.Vector3(-32, 5.0, 10)
      },
      fork: {
        pos: new THREE.Vector3(-15, 6.5, 17),
        target: new THREE.Vector3(-15, 2.8, 6)
      },
      syscall_dispatcher: {
        pos: new THREE.Vector3(-10, 9.5, 18),
        target: new THREE.Vector3(-10, 5.5, 0)
      },
      execve: {
        pos: new THREE.Vector3(-5, 6.5, 17),
        target: new THREE.Vector3(-5, 2.8, 6)
      },
      fd_table: {
        pos: new THREE.Vector3(-10, 9.5, 18),
        target: new THREE.Vector3(-10, 5.5, 0)
      },
      cpu_core: {
        pos: new THREE.Vector3(10, 8.5, 11),
        target: new THREE.Vector3(10, 2.5, -2)
      },
      scheduler: {
        pos: new THREE.Vector3(10, 8.5, 11),
        target: new THREE.Vector3(10, 2.5, -2)
      },
      mmu_memory: {
        pos: new THREE.Vector3(22, 9.0, 12),
        target: new THREE.Vector3(22, 3.5, -2)
      },
      vfs_tree: {
        pos: new THREE.Vector3(38, 7.5, 22),
        target: new THREE.Vector3(38, 2.5, 12)
      },
      page_cache: {
        pos: new THREE.Vector3(38, 7.5, 22),
        target: new THREE.Vector3(38, 2.5, 12)
      },
      storage_disk: {
        pos: new THREE.Vector3(46, 8.5, 23),
        target: new THREE.Vector3(46, 2.5, 12)
      },
      disk: {
        pos: new THREE.Vector3(46, 8.5, 23),
        target: new THREE.Vector3(46, 2.5, 12)
      }
    };

    this.currentPreset = 'overview';
    this.setupControls();
  }

  setupControls() {
    this.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.isDragging = true;
      if (e.button === 2) this.isPanning = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
      this.isPanning = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging && !this.isPanning) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      if (this.isDragging) {
        this.spherical.theta -= deltaX * 0.006;
        this.spherical.phi -= deltaY * 0.006;
        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

        const offset = new THREE.Vector3().setFromSpherical(this.spherical);
        this.camera.position.copy(this.target).add(offset);
        this.camera.lookAt(this.target);
      } else if (this.isPanning) {
        const panSpeed = 0.05;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

        const panVector = right.clone().multiplyScalar(-deltaX * panSpeed)
          .add(new THREE.Vector3(0, 1, 0).multiplyScalar(deltaY * panSpeed));

        this.target.add(panVector);
        this.camera.position.add(panVector);
      }

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    this.domElement.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = 1 + e.deltaY * 0.001;
      this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius * zoomFactor));

      const offset = new THREE.Vector3().setFromSpherical(this.spherical);
      this.camera.position.copy(this.target).add(offset);
      this.camera.lookAt(this.target);
    }, { passive: false });

    this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  zoomToNode(nodeId, duration = 900) {
    const view = this.nodeZoomViews[nodeId];
    if (!view) return;

    this.animateTo(view.pos, view.target, duration);
  }

  transitionTo(presetKey, duration = 900) {
    const preset = this.presets[presetKey];
    if (!preset) return;

    this.currentPreset = presetKey;
    this.animateTo(preset.pos, preset.target, duration);
  }

  animateTo(targetPos, targetLookAt, duration = 900) {
    const startPos = this.camera.position.clone();
    const startTarget = this.target.clone();

    new TWEEN.Tween({
      x: startPos.x, y: startPos.y, z: startPos.z,
      tx: startTarget.x, ty: startTarget.y, tz: startTarget.z
    })
      .to({
        x: targetPos.x, y: targetPos.y, z: targetPos.z,
        tx: targetLookAt.x, ty: targetLookAt.y, tz: targetLookAt.z
      }, duration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate((obj) => {
        this.camera.position.set(obj.x, obj.y, obj.z);
        this.target.set(obj.tx, obj.ty, obj.tz);
        this.spherical.setFromVector3(this.camera.position.clone().sub(this.target));
        this.camera.lookAt(this.target);
      })
      .start();
  }
}
