import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export class CameraManager {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Camera target (lookAt point)
    this.target = new THREE.Vector3(0, 4, 0);

    // Orbit state
    this.isDragging = false;
    this.isPanning = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.spherical = new THREE.Spherical();
    this.spherical.setFromVector3(this.camera.position.clone().sub(this.target));

    this.minDistance = 6;
    this.maxDistance = 160;
    this.minPolarAngle = 0.1;
    this.maxPolarAngle = Math.PI / 2 + 0.05;

    // Overview Presets
    this.presets = {
      overview: {
        pos: new THREE.Vector3(-4, 36, 68),
        target: new THREE.Vector3(-4, 3, 2),
        name: 'Full Motherboard'
      },
      userspace: {
        pos: new THREE.Vector3(-36, 12, 26),
        target: new THREE.Vector3(-36, 3.5, 10),
        name: 'Terminal & Shell'
      },
      syscall: {
        pos: new THREE.Vector3(-10, 11, 20),
        target: new THREE.Vector3(-10, 4.0, 2),
        name: 'Syscall Security Gate'
      },
      kernel: {
        pos: new THREE.Vector3(16, 12, 16),
        target: new THREE.Vector3(16, 3.0, -2),
        name: 'CPU & RAM Memory'
      },
      vfs: {
        pos: new THREE.Vector3(40, 12, 25),
        target: new THREE.Vector3(40, 3.0, 11),
        name: 'NVMe SSD Storage'
      }
    };

    // Close-Up Node Views (Framed directly in viewport center)
    this.nodeZoomViews = {
      terminal: {
        pos: new THREE.Vector3(-38.5, 6.2, 19.5),
        target: new THREE.Vector3(-38.5, 3.6, 10)
      },
      lexer: {
        pos: new THREE.Vector3(-29.0, 6.8, 18.0),
        target: new THREE.Vector3(-31.0, 3.8, 10)
      },
      path: {
        pos: new THREE.Vector3(-29.0, 6.8, 18.0),
        target: new THREE.Vector3(-31.0, 3.8, 10)
      },
      fork: {
        pos: new THREE.Vector3(-14.5, 5.2, 14.5),
        target: new THREE.Vector3(-14.5, 2.0, 5.0)
      },
      syscall_dispatcher: {
        pos: new THREE.Vector3(-10.0, 7.5, 16.0),
        target: new THREE.Vector3(-10.0, 4.2, 0)
      },
      execve: {
        pos: new THREE.Vector3(-5.5, 5.2, 14.5),
        target: new THREE.Vector3(-5.5, 2.0, 5.0)
      },
      fd_table: {
        pos: new THREE.Vector3(-10.0, 7.5, 16.0),
        target: new THREE.Vector3(-10.0, 4.2, 0)
      },
      cpu_core: {
        pos: new THREE.Vector3(10.5, 6.5, 6.5),
        target: new THREE.Vector3(10.5, 1.8, -2.5)
      },
      scheduler: {
        pos: new THREE.Vector3(10.5, 6.5, 6.5),
        target: new THREE.Vector3(10.5, 1.8, -2.5)
      },
      mmu_memory: {
        pos: new THREE.Vector3(21.5, 6.8, 7.0),
        target: new THREE.Vector3(21.5, 2.2, -2.5)
      },
      vfs_tree: {
        pos: new THREE.Vector3(36.0, 5.8, 19.5),
        target: new THREE.Vector3(36.0, 1.8, 11.5)
      },
      page_cache: {
        pos: new THREE.Vector3(36.0, 5.8, 19.5),
        target: new THREE.Vector3(36.0, 1.8, 11.5)
      },
      storage_disk: {
        pos: new THREE.Vector3(45.5, 6.2, 20.0),
        target: new THREE.Vector3(45.5, 1.8, 11.5)
      },
      disk: {
        pos: new THREE.Vector3(45.5, 6.2, 20.0),
        target: new THREE.Vector3(45.5, 1.8, 11.5)
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

  zoomToNode(nodeId, duration = 800) {
    const view = this.nodeZoomViews[nodeId];
    if (!view) return;

    this.animateTo(view.pos, view.target, duration);
  }

  transitionTo(presetKey, duration = 800) {
    const preset = this.presets[presetKey];
    if (!preset) return;

    this.currentPreset = presetKey;
    this.animateTo(preset.pos, preset.target, duration);
  }

  animateTo(targetPos, targetLookAt, duration = 800) {
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
