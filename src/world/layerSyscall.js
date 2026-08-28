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
    const baseGeo = new THREE.BoxGeometry(22, 0.6, 20);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x120a1f,
      metalness: 0.9,
      roughness: 0.3
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.3;
    this.group.add(baseMesh);

    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xff0077, transparent: true, opacity: 0.6 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.3;
    this.group.add(edgeLines);
  }

  buildGateModel() {
    // ==========================================
    // 1. INDUSTRIAL SERVER RACK SECURITY ARCH
    // ==========================================
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, 0);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0c1322,
      metalness: 0.9,
      roughness: 0.2
    });

    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.4, 1.8), pillarMat);
    leftPillar.position.set(-4.8, 3.2, 0);
    archGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.4, 1.8), pillarMat);
    rightPillar.position.set(4.8, 3.2, 0);
    archGroup.add(rightPillar);

    // Top Gateway Header Bridge
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(11.2, 1.4, 2.0), pillarMat);
    topBeam.position.set(0, 6.4, 0);
    archGroup.add(topBeam);

    // Laser-Engraved Gateway Face Texture
    const gateCanvas = document.createElement('canvas');
    gateCanvas.width = 512;
    gateCanvas.height = 128;
    const gCtx = gateCanvas.getContext('2d');
    gCtx.fillStyle = '#060a14';
    gCtx.fillRect(0, 0, 512, 128);
    gCtx.strokeStyle = '#ff0077';
    gCtx.lineWidth = 4;
    gCtx.strokeRect(4, 4, 504, 120);

    gCtx.fillStyle = '#ff0077';
    gCtx.font = 'bold 24px "Fira Code", monospace';
    gCtx.textAlign = 'center';
    gCtx.fillText('HARDWARE PRIVILEGE BOUNDARY', 256, 44);

    gCtx.fillStyle = '#f8fafc';
    gCtx.font = 'bold 18px "Fira Code", monospace';
    gCtx.fillText('RING 3 (USER)  ➔  RING 0 (KERNEL)', 256, 80);

    gCtx.fillStyle = '#94a3b8';
    gCtx.font = '13px monospace';
    gCtx.fillText('MSR_LSTAR • Syscall Entry Point', 256, 110);

    const gateTex = new THREE.CanvasTexture(gateCanvas);
    const gateLabel = new THREE.Mesh(
      new THREE.PlaneGeometry(10.8, 1.2),
      new THREE.MeshBasicMaterial({ map: gateTex })
    );
    gateLabel.position.set(0, 6.4, 1.02);
    archGroup.add(gateLabel);

    // High-Tech Holographic Firewall Curtain
    const shieldGeo = new THREE.PlaneGeometry(8.0, 5.6);
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0xff0077,
      transmission: 0.7,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, 3.2, 0);
    archGroup.add(this.shieldMesh);

    // Gate Under-glow
    const gateHaloGeo = new THREE.RingGeometry(3.2, 3.8, 32);
    const gateHaloMat = new THREE.MeshBasicMaterial({
      color: 0xff0077,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    this.gateHalo = new THREE.Mesh(gateHaloGeo, gateHaloMat);
    this.gateHalo.rotation.x = -Math.PI / 2;
    this.gateHalo.position.set(0, 0.05, 0);
    archGroup.add(this.gateHalo);

    this.group.add(archGroup);
    this.nodes['syscall_dispatcher'] = topBeam;

    this.sceneManager.registerInteractiveObject(topBeam, {
      id: 'syscall_dispatcher',
      title: '🛡️ Syscall Hardware Gateway (MSR_LSTAR)',
      layer: 'Hardware Privilege Switch & Kernel Boundary',
      summary: 'Switches CPU privilege from User Mode (Ring 3) to Kernel Mode (Ring 0).',
      details: 'User programs cannot touch hardware directly. The `syscall` CPU instruction safely jumps to kernel entry point via MSR 0xC0000082.'
    });

    // ==========================================
    // 2. FORK() PROCESS CLONER RACK UNIT
    // ==========================================
    const forkGroup = new THREE.Group();
    forkGroup.position.set(-4.0, 0, 4.5);

    const rackMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.9,
      roughness: 0.2
    });

    const forkPod = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.8, 3.6), rackMat);
    forkPod.position.y = 1.4;
    forkGroup.add(forkPod);

    // Status LED Array on Front
    for (let l = 0; l < 4; l++) {
      const led = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12),
        new THREE.MeshBasicMaterial({ color: 0x00ff88 })
      );
      led.rotation.x = Math.PI / 2;
      led.position.set(-1.2 + l * 0.8, 2.2, 1.82);
      forkGroup.add(led);
    }

    const forkHalo = new THREE.Mesh(
      new THREE.RingGeometry(2.0, 2.5, 32),
      new THREE.MeshBasicMaterial({ color: 0xff9500, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    forkHalo.rotation.x = -Math.PI / 2;
    forkHalo.position.y = 0.05;
    forkGroup.add(forkHalo);
    this.forkHalo = forkHalo;

    this.group.add(forkGroup);
    this.nodes['fork'] = forkGroup;

    this.sceneManager.registerInteractiveObject(forkPod, {
      id: 'fork',
      title: '👥 fork() / clone3() Process Factory',
      layer: 'Kernel Process Management Subsystem',
      summary: 'Clones the parent shell into an identical child worker process with a new PID.',
      details: 'Duplicating the process via task_struct prevents the parent terminal session from being replaced and terminated.'
    });

    // ==========================================
    // 3. EXECVE() BINARY RELOADER RACK UNIT
    // ==========================================
    const execGroup = new THREE.Group();
    execGroup.position.set(4.0, 0, 4.5);

    const execPod = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.8, 3.6), rackMat);
    execPod.position.y = 1.4;
    execGroup.add(execPod);

    // Status LED Array on Front
    for (let l = 0; l < 4; l++) {
      const led = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12),
        new THREE.MeshBasicMaterial({ color: 0x00f3ff })
      );
      led.rotation.x = Math.PI / 2;
      led.position.set(-1.2 + l * 0.8, 2.2, 1.82);
      execGroup.add(led);
    }

    const execHalo = new THREE.Mesh(
      new THREE.RingGeometry(2.0, 2.5, 32),
      new THREE.MeshBasicMaterial({ color: 0x30d158, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    execHalo.rotation.x = -Math.PI / 2;
    execHalo.position.y = 0.05;
    execGroup.add(execHalo);
    this.execHalo = execHalo;

    this.group.add(execGroup);
    this.nodes['execve'] = execGroup;
    this.nodes['fd_table'] = topBeam;

    this.sceneManager.registerInteractiveObject(execPod, {
      id: 'execve',
      title: '⚡ execve() ELF Binary Reloader',
      layer: 'Kernel Exec Subsystem (Ring 0)',
      summary: 'Replaces the child process memory with the compiled program loaded from storage.',
      details: 'Wipes previous memory allocations, initializes new stack/heap, and points instruction pointer RIP to the program entry point.'
    });
  }

  highlightNode(nodeId, active = true, colorHex = 0xff0055) {
    if (nodeId === 'syscall_dispatcher' && this.gateHalo) {
      this.gateHalo.material.color.setHex(colorHex);
      this.gateHalo.material.opacity = active ? 0.9 : 0;
    } else if (nodeId === 'fork' && this.forkHalo) {
      this.forkHalo.material.color.setHex(colorHex);
      this.forkHalo.material.opacity = active ? 0.9 : 0;
    } else if (nodeId === 'execve' && this.execHalo) {
      this.execHalo.material.color.setHex(colorHex);
      this.execHalo.material.opacity = active ? 0.9 : 0;
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
