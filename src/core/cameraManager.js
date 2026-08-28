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

    this.minDistance = 15;
    this.maxDistance = 180;
    this.minPolarAngle = 0.1;
    this.maxPolarAngle = Math.PI / 2 + 0.1;

    // Waypoints for architectural layers
    this.presets = {
      overview: {
        pos: new THREE.Vector3(0, 48, 82),
        target: new THREE.Vector3(0, 4, 0),
        name: 'Full System View'
      },
      userspace: {
        pos: new THREE.Vector3(-38, 22, 42),
        target: new THREE.Vector3(-35, 6, 15),
        name: 'User Space & Shell'
      },
      syscall: {
        pos: new THREE.Vector3(-8, 24, 38),
        target: new THREE.Vector3(-10, 6, 0),
        name: 'Syscall Gateway (Ring 3/0)'
      },
      kernel: {
        pos: new THREE.Vector3(18, 26, 36),
        target: new THREE.Vector3(15, 7, -5),
        name: 'Kernel, CPU & MMU'
      },
      vfs: {
        pos: new THREE.Vector3(46, 24, 38),
        target: new THREE.Vector3(42, 6, 12),
        name: 'VFS & Hardware Storage'
      }
    };

    this.currentPreset = 'overview';
    this.setupControls();
  }

  setupControls() {
    this.domElement.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.isDragging = true; // Left click rotate
      if (e.button === 2) this.isPanning = true;  // Right click pan
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
        // Orbit rotation
        this.spherical.theta -= deltaX * 0.006;
        this.spherical.phi -= deltaY * 0.006;
        this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

        const offset = new THREE.Vector3().setFromSpherical(this.spherical);
        this.camera.position.copy(this.target).add(offset);
        this.camera.lookAt(this.target);
      } else if (this.isPanning) {
        // Pan target and camera
        const panSpeed = 0.06;
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

  transitionTo(presetKey, duration = 1200) {
    const preset = this.presets[presetKey];
    if (!preset) return;

    this.currentPreset = presetKey;

    const startPos = this.camera.position.clone();
    const startTarget = this.target.clone();

    new TWEEN.Tween({
      x: startPos.x, y: startPos.y, z: startPos.z,
      tx: startTarget.x, ty: startTarget.y, tz: startTarget.z
    })
      .to({
        x: preset.pos.x, y: preset.pos.y, z: preset.pos.z,
        tx: preset.target.x, ty: preset.target.y, tz: preset.target.z
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

  focusOnPoint(targetPos, cameraOffset = new THREE.Vector3(0, 12, 22), duration = 1000) {
    const startPos = this.camera.position.clone();
    const startTarget = this.target.clone();
    const endPos = targetPos.clone().add(cameraOffset);

    new TWEEN.Tween({
      x: startPos.x, y: startPos.y, z: startPos.z,
      tx: startTarget.x, ty: startTarget.y, tz: startTarget.z
    })
      .to({
        x: endPos.x, y: endPos.y, z: endPos.z,
        tx: targetPos.x, ty: targetPos.y, tz: targetPos.z
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
