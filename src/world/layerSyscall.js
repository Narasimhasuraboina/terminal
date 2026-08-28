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
    const baseGeo = new THREE.BoxGeometry(22, 1.2, 22);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x181028,
      metalness: 0.8,
      roughness: 0.25,
      emissive: 0x4a154b,
      emissiveIntensity: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.6;
    this.group.add(baseMesh);

    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xff0077, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.6;
    this.group.add(edgeLines);

    this.createHoloLabel('🛡️ STEP 2: SECURITY GATEWAY (RING 3 ➔ 0)', new THREE.Vector3(0, 13, -9), 0xff0077, '#ff0077');
  }

  createHoloLabel(text, pos, colorHex, borderHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 130;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(24, 6, 28, 0.92)';
    ctx.roundRect(10, 10, 580, 110, 18);
    ctx.fill();
    ctx.strokeStyle = borderHex;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 300, 65);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.copy(pos);
    sprite.scale.set(13, 2.8, 1);
    this.group.add(sprite);
  }

  buildGateModel() {
    // 1. Massive Security Arch (The Gateway between User Space & Kernel)
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, 0);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1f1430,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xff0055,
      emissiveIntensity: 0.2
    });

    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(2, 8, 2), pillarMat);
    leftPillar.position.set(-6, 4, 0);
    archGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(2, 8, 2), pillarMat);
    rightPillar.position.set(6, 4, 0);
    archGroup.add(rightPillar);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(14, 2, 2.2), pillarMat);
    topBeam.position.set(0, 8, 0);
    archGroup.add(topBeam);

    // Glowing Laser Forcefield Curtain
    const shieldGeo = new THREE.PlaneGeometry(10, 7);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, 4, 0);
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
      new THREE.CylinderGeometry(2, 2.2, 3.5, 16),
      new THREE.MeshStandardMaterial({
        color: 0x221035,
        emissive: 0xff9500,
        emissiveIntensity: 0.3,
        metalness: 0.8
      })
    );
    forkPod.position.set(-5, 2, 6);
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
      new THREE.CylinderGeometry(2, 2.2, 3.5, 16),
      new THREE.MeshStandardMaterial({
        color: 0x221035,
        emissive: 0x30d158,
        emissiveIntensity: 0.3,
        metalness: 0.8
      })
    );
    execPod.position.set(5, 2, 6);
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
      node.scale.set(1.15, 1.15, 1.15);
      if (node.material && node.material.emissive) {
        node.material.emissive.setHex(colorHex);
        node.material.emissiveIntensity = 0.95;
      }
    } else {
      node.scale.set(1, 1, 1);
      if (node.material && node.material.emissive) {
        node.material.emissiveIntensity = 0.2;
      }
    }
  }

  pulseRingShield() {
    if (this.shieldMesh) {
      this.shieldMesh.scale.set(1.1, 1.1, 1.1);
      setTimeout(() => {
        if (this.shieldMesh) this.shieldMesh.scale.set(1, 1, 1);
      }, 300);
    }
  }

  update(delta) {}
}
