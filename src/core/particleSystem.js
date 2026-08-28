import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.activePackets = [];
    this.bursts = [];

    // Shared geometry & materials
    this.packetGeo = new THREE.SphereGeometry(0.7, 16, 16);
    this.packetMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: false
    });

    // Glowing outer shell
    this.glowGeo = new THREE.SphereGeometry(1.2, 16, 16);
    this.glowMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
  }

  // Spawns a glowing data packet that flies along a 3D curve
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
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      })
    );

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
      onComplete: onComplete
    };

    this.activePackets.push(packetData);
    return packetData;
  }

  createBurst(position, color = 0x00ffff, count = 24) {
    const particles = [];
    const geo = new THREE.BufferGeometry();
    const posArray = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      posArray[i * 3] = position.x;
      posArray[i * 3 + 1] = position.y;
      posArray[i * 3 + 2] = position.z;

      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI;
      const speed = 2 + Math.random() * 5;

      velocities.push(new THREE.Vector3(
        Math.cos(angle) * Math.cos(elevation) * speed,
        Math.sin(elevation) * speed,
        Math.sin(angle) * Math.cos(elevation) * speed
      ));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.6,
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
      maxAge: 0.6
    });
  }

  clear() {
    this.activePackets.forEach(p => this.scene.remove(p.group));
    this.activePackets = [];
    this.bursts.forEach(b => this.scene.remove(b.mesh));
    this.bursts = [];
  }

  update(delta) {
    // Update traveling data packets
    for (let i = this.activePackets.length - 1; i >= 0; i--) {
      const p = this.activePackets[i];
      p.progress += delta * p.speed;

      if (p.progress >= 1.0) {
        const endPt = p.curve.getPointAt(1.0);
        this.createBurst(endPt, p.group.children[0].material.color);
        this.scene.remove(p.group);
        if (p.onComplete) p.onComplete();
        this.activePackets.splice(i, 1);
      } else {
        const pt = p.curve.getPointAt(p.progress);
        p.group.position.copy(pt);
        p.group.children[1].scale.setScalar(1 + Math.sin(Date.now() * 0.02) * 0.2);
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
  }
}
