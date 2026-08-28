import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export class WaypointBeacon {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.buildBeaconMesh();
    this.buildInfoBillboard();
  }

  buildBeaconMesh() {
    // 1. Vertical Glowing Laser Beam
    const beamGeo = new THREE.CylinderGeometry(0.15, 0.15, 14, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    this.beam = new THREE.Mesh(beamGeo, beamMat);
    this.beam.position.y = 7;
    this.group.add(this.beam);

    // 2. Pulsing Ground Concentric Rings
    this.rings = [];
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(0.8 + i * 0.8, 1.1 + i * 0.8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.8 - i * 0.2,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      this.group.add(ring);
      this.rings.push(ring);
    }

    // 3. Floating 3D Diamond Marker Pin
    const pinGeo = new THREE.OctahedronGeometry(1.2);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0x00f3ff,
      emissive: 0x00f3ff,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.1
    });
    this.pin = new THREE.Mesh(pinGeo, pinMat);
    this.pin.position.y = 12;
    this.group.add(this.pin);
  }

  buildInfoBillboard() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 640;
    this.canvas.height = 320;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: this.texture, transparent: true });
    this.billboard = new THREE.Sprite(spriteMat);
    this.billboard.position.set(0, 16, 0);
    this.billboard.scale.set(16, 8, 1);
    this.group.add(this.billboard);

    this.updateBillboard({
      location: '1. User Terminal Display',
      route: 'Input ➔ Shell Parser',
      action: 'Captures raw keystrokes from keyboard',
      why: 'User programs start here in User Space (Ring 3)'
    });
  }

  updateBillboard(info) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 640, 320);

    // High-contrast cyber card background
    ctx.fillStyle = 'rgba(6, 12, 28, 0.95)';
    ctx.roundRect(10, 10, 620, 300, 20);
    ctx.fill();

    // Glowing cyan/magenta border
    ctx.strokeStyle = info.isError ? '#ff0055' : '#00f3ff';
    ctx.lineWidth = 6;
    ctx.stroke();

    // 1. Header: Location
    ctx.fillStyle = info.isError ? '#ff0055' : '#00ff88';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText(`📍 ${info.location || 'Active Hardware Node'}`, 30, 52);

    // 2. Route Line
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`🛣️ ROUTE: ${info.route || 'Local Processing'}`, 30, 92);

    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 110);
    ctx.lineTo(610, 110);
    ctx.stroke();

    // 3. What Happens Here
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText(`⚡ WHAT HAPPENS HERE:`, 30, 140);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = '#cbd5e1';
    this.wrapText(ctx, info.action || 'Executing step...', 30, 168, 560, 22);

    // 4. Why We Go Here (Crucial Educational Context)
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 17px system-ui, sans-serif';
    ctx.fillText(`❓ WHY WE GO HERE:`, 30, 225);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = '#fde68a';
    this.wrapText(ctx, info.why || 'Required for hardware security and kernel architecture.', 30, 252, 560, 22);

    this.texture.needsUpdate = true;
  }

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, curY);
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
    // Rotate 3D diamond pin
    if (this.pin) {
      this.pin.rotation.y += delta * 2;
      this.pin.rotation.x += delta * 1.2;
      this.pin.position.y = 12 + Math.sin(Date.now() * 0.004) * 0.5;
    }

    // Expand and fade ground rings
    this.rings.forEach((ring, idx) => {
      const scale = (Date.now() * 0.002 + idx * 0.33) % 1;
      ring.scale.setScalar(1 + scale * 0.8);
      ring.material.opacity = Math.max(0, 1 - scale);
    });
  }
}
