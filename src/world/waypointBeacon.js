import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export class WaypointBeacon {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.buildBeaconMesh();
  }

  buildBeaconMesh() {
    // 1. Vertical Glowing Light Column / Laser
    const beamGeo = new THREE.CylinderGeometry(0.12, 0.25, 12, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    this.beam = new THREE.Mesh(beamGeo, beamMat);
    this.beam.position.y = 6;
    this.group.add(this.beam);

    // 2. Concentric Ground Rings
    this.rings = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(0.6 + i * 0.7, 0.85 + i * 0.7, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.8 - i * 0.25,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.08;
      this.group.add(ring);
      this.rings.push(ring);
    }

    // 3. Floating 3D Diamond Pin
    const pinGeo = new THREE.OctahedronGeometry(1.0);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00f3ff,
      emissiveIntensity: 0.9,
      metalness: 0.9,
      roughness: 0.1
    });
    this.pin = new THREE.Mesh(pinGeo, pinMat);
    this.pin.position.y = 11;
    this.group.add(this.pin);

    // 4. Subtle Floating Pin Label Tag (Compact & Clean, never clips into top HUD)
    this.canvas = document.createElement('canvas');
    this.canvas.width = 384;
    this.canvas.height = 96;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: this.texture, transparent: true });
    this.labelSprite = new THREE.Sprite(spriteMat);
    this.labelSprite.position.set(0, 13.2, 0);
    this.labelSprite.scale.set(7, 1.8, 1);
    this.group.add(this.labelSprite);

    this.updateLabel('1. User Terminal', false);
  }

  updateLabel(text, isError = false) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 384, 96);

    ctx.fillStyle = 'rgba(6, 12, 28, 0.9)';
    ctx.roundRect(6, 6, 372, 84, 16);
    ctx.fill();

    ctx.strokeStyle = isError ? '#ff0055' : '#00f3ff';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = isError ? '#ff0055' : '#00ff88';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`📍 ${text}`, 192, 48);

    this.texture.needsUpdate = true;

    if (this.pin) {
      this.pin.material.color.setHex(isError ? 0xff0055 : 0x00f3ff);
      this.pin.material.emissive.setHex(isError ? 0xff0055 : 0x00f3ff);
      this.beam.material.color.setHex(isError ? 0xff0055 : 0x00f3ff);
      this.rings.forEach(r => r.material.color.setHex(isError ? 0xff0055 : 0x00f3ff));
    }
  }

  moveTo(targetPos, duration = 800) {
    const startPos = this.group.position.clone();
    new TWEEN.Tween({ x: startPos.x, y: startPos.y, z: startPos.z })
      .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z }, duration)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate((obj) => {
        this.group.position.set(obj.x, obj.y, obj.z);
      })
      .start();
  }

  update(delta) {
    if (this.pin) {
      this.pin.rotation.y += delta * 2;
      this.pin.position.y = 11 + Math.sin(Date.now() * 0.004) * 0.4;
    }
    this.rings.forEach((ring, idx) => {
      const scale = (Date.now() * 0.0015 + idx * 0.33) % 1;
      ring.scale.setScalar(1 + scale * 0.8);
      ring.material.opacity = Math.max(0, 0.8 - scale * 0.8);
    });
  }
}
