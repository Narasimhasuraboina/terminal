import * as THREE from 'three';

export class LayerSyscall {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.group = new THREE.Group();
    this.group.position.set(-10, 0, 0);
    this.scene.add(this.group);

    this.nodes = {};
    this.buildPlatform();
    this.buildGateModel();
  }

  buildPlatform() {
    const baseGeo = new THREE.BoxGeometry(22, 0.8, 22);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x140d22,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x4a154b,
      emissiveIntensity: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.4;
    this.group.add(baseMesh);

    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xff0077, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.4;
    this.group.add(edgeLines);

    this.createHoloLabel('🛡️ STEP 2: SECURITY GATEWAY (RING 3 ➔ 0)', new THREE.Vector3(0, 10.5, -8.0), 0xff0077, '#ff0077');
  }

  createHoloLabel(text, pos, colorHex, borderHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(20, 6, 24, 0.9)';
    ctx.roundRect(8, 8, 496, 84, 14);
    ctx.fill();
    ctx.strokeStyle = borderHex;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 50);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(pos);
    sprite.scale.set(10, 2.0, 1);
    this.group.add(sprite);
  }

  buildGateModel() {
    // 1. Cyber Security Arch (User Space ➔ Kernel Space Gate)
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, 0);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1a0f2e,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xff0055,
      emissiveIntensity: 0.15
    });

    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.5, 1.6), pillarMat);
    leftPillar.position.set(-5, 3.25, 0);
    archGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.5, 1.6), pillarMat);
    rightPillar.position.set(5, 3.25, 0);
    archGroup.add(rightPillar);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(11.6, 1.4, 1.8), pillarMat);
    topBeam.position.set(0, 6.5, 0);
    archGroup.add(topBeam);

    // Glowing Laser Forcefield Curtain
    const shieldGeo = new THREE.PlaneGeometry(8.4, 5.8);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, 3.25, 0);
    archGroup.add(this.shieldMesh);

    this.group.add(archGroup);
    this.nodes['syscall_dispatcher'] = topBeam;

    this.sceneManager.registerInteractiveObject(topBeam, {
      id: 'syscall_dispatcher',
      title: '🛡️ Syscall Gateway (CPU Privilege Switch)',
      layer: 'Hardware Privilege Boundary',
      summary: 'Switches CPU from User Mode (Ring 3) to Kernel Mode (Ring 0).',
      details: 'User programs cannot touch hardware directly. The `syscall` instruction safely hands control to the Linux kernel.'
    });

    // 2. Process Cloning Chamber (fork station)
    const forkPod = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.8, 3.0, 16),
      new THREE.MeshStandardMaterial({
        color: 0x1f0e2f,
        emissive: 0xff9500,
        emissiveIntensity: 0.3,
        metalness: 0.8
      })
    );
    forkPod.position.set(-4.5, 1.5, 5.0);
    this.group.add(forkPod);

    this.nodes['fork'] = forkPod;
    this.sceneManager.registerInteractiveObject(forkPod, {
      id: 'fork',
      title: '👥 fork() Process Cloner',
      layer: 'Kernel Process Management',
      summary: 'Clones the parent shell into an identical child worker process with a new PID.',
      details: 'Prevents the shell from being terminated when the command finishes.'
    });

    // 3. Execve Transformation Chamber
    const execPod = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.8, 3.0, 16),
      new THREE.MeshStandardMaterial({
        color: 0x1f0e2f,
        emissive: 0x30d158,
        emissiveIntensity: 0.3,
        metalness: 0.8
      })
    );
    execPod.position.set(4.5, 1.5, 5.0);
    this.group.add(execPod);

    this.nodes['execve'] = execPod;
    this.nodes['fd_table'] = topBeam;

    this.sceneManager.registerInteractiveObject(execPod, {
      id: 'execve',
      title: '⚡ execve() Program Reloader',
      layer: 'Kernel Exec Subsystem',
      summary: 'Replaces the child process memory with the compiled program from disk.',
      details: 'Clears old memory and loads the new ELF binary (e.g. /usr/bin/ls).'
    });
  }

  highlightNode(nodeId, active = true, colorHex = 0xff0055) {
    const node = this.nodes[nodeId];
    if (!node) return;

    if (active) {
      node.scale.set(1.1, 1.1, 1.1);
      if (node.material && node.material.emissive) {
        node.material.emissive.setHex(colorHex);
        node.material.emissiveIntensity = 0.95;
      }
    } else {
      node.scale.set(1, 1, 1);
      if (node.material && node.material.emissive) {
        node.material.emissiveIntensity = 0.15;
      }
    }
  }

  pulseRingShield() {
    if (this.shieldMesh) {
      this.shieldMesh.scale.set(1.08, 1.08, 1.08);
      setTimeout(() => {
        if (this.shieldMesh) this.shieldMesh.scale.set(1, 1, 1);
      }, 300);
    }
  }

  update(delta) {}
}
