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
    // 1. Concentric Ground Target Rings (Highlights active station without blocking hardware)
    this.rings = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(1.0 + i * 0.9, 1.3 + i * 0.9, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.75 - i * 0.22,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.08;
      this.group.add(ring);
      this.rings.push(ring);
    }

    // 2. High-Contrast Floating Stage Label Tag (Floats in open air at y = 8.5)
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 128;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: this.texture, transparent: true, depthTest: false });
    this.labelSprite = new THREE.Sprite(spriteMat);
    this.labelSprite.position.set(0, 8.5, 0);
    this.labelSprite.scale.set(6.8, 1.7, 1);
    this.group.add(this.labelSprite);

    this.updateLabel('1. User Terminal', false);
  }

  updateLabel(text, isError = false) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 512, 128);

    // High-Contrast Cyber Tag
    ctx.fillStyle = 'rgba(6, 12, 28, 0.95)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 112, 20);
    ctx.fill();

    ctx.strokeStyle = isError ? '#ff0055' : '#00f3ff';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = isError ? '#ff0055' : '#00ff88';
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`📍 ${text}`, 256, 64);

    this.texture.needsUpdate = true;

    this.rings.forEach(r => r.material.color.setHex(isError ? 0xff0055 : 0x00f3ff));
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
    if (this.labelSprite) {
      this.labelSprite.position.y = 8.5 + Math.sin(Date.now() * 0.003) * 0.2;
    }
    this.rings.forEach((ring, idx) => {
      const scale = (Date.now() * 0.0015 + idx * 0.33) % 1;
      ring.scale.setScalar(1 + scale * 0.8);
      ring.material.opacity = Math.max(0, 0.8 - scale * 0.8);
    });
  }
}
