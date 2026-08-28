import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.activePackets = [];
    this.bursts = [];

    // Shared geometry & materials
    // Shared geometry & materials
    this.packetGeo = new THREE.SphereGeometry(0.75, 16, 16);
    this.glowGeo = new THREE.SphereGeometry(1.4, 16, 16);
    this.shockwaves = [];
  }

  // Spawns a glowing data packet that flies along a 3D curve with comet tail trail
  sendPacket(curve, duration = 1.0, color = 0x00ffff, onComplete = null) {
    const packetGroup = new THREE.Group();

    const coreMesh = new THREE.Mesh(
      this.packetGeo,
      new THREE.MeshBasicMaterial({ color: color })
    );
    const glowMesh = new THREE.Mesh(
      this.glowGeo,
      new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      })
    );

    // Dynamic point light on the photon packet
    const pLight = new THREE.PointLight(color, 2.0, 15);
    packetGroup.add(pLight);

    packetGroup.add(coreMesh);
    packetGroup.add(glowMesh);

    // Initial position
    const startPt = curve.getPointAt(0);
    packetGroup.position.copy(startPt);
    this.scene.add(packetGroup);

    const packetData = {
      group: packetGroup,
      curve: curve,
      progress: 0,
      speed: 1 / Math.max(0.1, duration),
      color: color,
      onComplete: onComplete,
      trailTimer: 0
    };

    this.activePackets.push(packetData);
    return packetData;
  }

  createShockwave(position, color = 0x00ffff) {
    const ringGeo = new THREE.RingGeometry(0.5, 1.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(position.x, position.y + 0.1, position.z);
    this.scene.add(ring);

    this.shockwaves.push({
      mesh: ring,
      age: 0,
      maxAge: 0.5,
      startScale: 1.0,
      endScale: 6.0
    });
  }

  createBurst(position, color = 0x00ffff, count = 28) {
    const geo = new THREE.BufferGeometry();
    const posArray = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      posArray[i * 3] = position.x;
      posArray[i * 3 + 1] = position.y;
      posArray[i * 3 + 2] = position.z;

      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI;
      const speed = 3 + Math.random() * 6;

      velocities.push(new THREE.Vector3(
        Math.cos(angle) * Math.cos(elevation) * speed,
        Math.sin(elevation) * speed,
        Math.sin(angle) * Math.cos(elevation) * speed
      ));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.75,
      color: color,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const pointCloud = new THREE.Points(geo, mat);
    this.scene.add(pointCloud);

    this.bursts.push({
      mesh: pointCloud,
      velocities: velocities,
      age: 0,
      maxAge: 0.65
    });

    this.createShockwave(position, color);
  }

  clear() {
    this.activePackets.forEach(p => this.scene.remove(p.group));
    this.activePackets = [];
    this.bursts.forEach(b => this.scene.remove(b.mesh));
    this.bursts = [];
    this.shockwaves.forEach(s => this.scene.remove(s.mesh));
    this.shockwaves = [];
  }

  update(delta) {
    // Update traveling data packets
    for (let i = this.activePackets.length - 1; i >= 0; i--) {
      const p = this.activePackets[i];
      p.progress += delta * p.speed;

      if (p.progress >= 1.0) {
        const endPt = p.curve.getPointAt(1.0);
        this.createBurst(endPt, p.color);
        this.scene.remove(p.group);
        if (p.onComplete) p.onComplete();
        this.activePackets.splice(i, 1);
      } else {
        const pt = p.curve.getPointAt(p.progress);
        p.group.position.copy(pt);
        p.group.children[1].scale.setScalar(1 + Math.sin(Date.now() * 0.02) * 0.25);
      }
    }

    // Update particle bursts
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.age += delta;

      if (b.age >= b.maxAge) {
        this.scene.remove(b.mesh);
        this.bursts.splice(i, 1);
      } else {
        const positions = b.mesh.geometry.attributes.position.array;
        const count = b.velocities.length;
        const decay = 1 - (b.age / b.maxAge);
        b.mesh.material.opacity = decay;

        for (let j = 0; j < count; j++) {
          positions[j * 3] += b.velocities[j].x * delta;
          positions[j * 3 + 1] += b.velocities[j].y * delta;
          positions[j * 3 + 2] += b.velocities[j].z * delta;
        }
        b.mesh.geometry.attributes.position.needsUpdate = true;
      }
    }

    // Update shockwave expanding rings
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.age += delta;

      if (s.age >= s.maxAge) {
        this.scene.remove(s.mesh);
        this.shockwaves.splice(i, 1);
      } else {
        const progress = s.age / s.maxAge;
        const currentScale = THREE.MathUtils.lerp(s.startScale, s.endScale, progress);
        s.mesh.scale.set(currentScale, currentScale, currentScale);
        s.mesh.material.opacity = (1 - progress) * 0.8;
      }
    }
  }
}
