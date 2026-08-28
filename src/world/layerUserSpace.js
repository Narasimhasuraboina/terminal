import * as THREE from 'three';

export class LayerUserSpace {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.group = new THREE.Group();
    this.group.position.set(-36, 0, 10);
    this.scene.add(this.group);

    this.nodes = {};
    this.buildPlatform();
    this.buildHardwareModels();
  }

  buildPlatform() {
    // Motherboard PCB Base Plate
    const baseGeo = new THREE.BoxGeometry(22, 0.6, 18);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x060e1a,
      metalness: 0.9,
      roughness: 0.3
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.3;
    this.group.add(baseMesh);

    // Glowing cyan edge line
    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.6 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.3;
    this.group.add(edgeLines);
  }

  buildHardwareModels() {
    // 1. Workstation Desk
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(15, 0.4, 9),
      new THREE.MeshStandardMaterial({ color: 0x0d1527, metalness: 0.7, roughness: 0.3 })
    );
    deskTop.position.set(0, 1.0, 0);
    this.group.add(deskTop);

    // Metallic Desk Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.0, 16), legMat);
    leg1.position.set(-6.5, 0, -3.5);
    this.group.add(leg1);
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.0, 16), legMat);
    leg2.position.set(6.5, 0, -3.5);
    this.group.add(leg2);

    // 2. Realistic Desktop Monitor
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(-2.5, 1.2, 0);

    // Base & Neck
    const standBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.6, 0.15, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.2 })
    );
    standBase.position.y = 0.08;
    monitorGroup.add(standBase);

    const standPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.18, 2.0, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 })
    );
    standPole.position.set(0, 1.05, -0.2);
    monitorGroup.add(standPole);

    // Slim Dark Bezel
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      metalness: 0.85,
      roughness: 0.3
    });
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.8, 0.25), bezelMat);
    bezel.position.set(0, 2.9, 0);
    monitorGroup.add(bezel);

    // Dynamic Live Monospace Screen Face
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 512;
    this.screenCanvas.height = 340;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.4, 3.4),
      new THREE.MeshBasicMaterial({ map: this.screenTexture })
    );
    screenMesh.position.set(0, 2.9, 0.13);
    monitorGroup.add(screenMesh);

    // Under-glow ring spotlight for active highlighting
    const haloGeo = new THREE.RingGeometry(2.0, 2.4, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    this.termHalo = new THREE.Mesh(haloGeo, haloMat);
    this.termHalo.rotation.x = -Math.PI / 2;
    this.termHalo.position.set(0, 0.05, 0);
    monitorGroup.add(this.termHalo);

    this.group.add(monitorGroup);
    this.nodes['terminal'] = monitorGroup;

    // 3. Mechanical Keyboard
    const kbBase = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.18, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.6, roughness: 0.4 })
    );
    kbBase.position.set(-2.5, 1.3, 2.4);
    this.group.add(kbBase);

    // 4. Realistic Gaming PC Tower (Shell / $PATH Station)
    const pcGroup = new THREE.Group();
    pcGroup.position.set(4.5, 1.2, 0);

    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x0a101d,
      metalness: 0.85,
      roughness: 0.25
    });
    const towerMesh = new THREE.Mesh(new THREE.BoxGeometry(3.0, 4.8, 4.6), towerMat);
    towerMesh.position.y = 2.4;
    pcGroup.add(towerMesh);

    // Tinted Glass Side Panel
    const glassMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 4.4),
      new THREE.MeshStandardMaterial({
        color: 0x00f3ff,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.25
      })
    );
    glassMesh.rotation.y = -Math.PI / 2;
    glassMesh.position.set(-1.51, 2.4, 0);
    pcGroup.add(glassMesh);

    // Front RGB Accent Line
    const frontRgb = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 4.2, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x00ff88 })
    );
    frontRgb.position.set(-1.42, 2.4, 2.2);
    pcGroup.add(frontRgb);

    // PC Under-glow ring
    const pcHaloGeo = new THREE.RingGeometry(2.0, 2.4, 32);
    const pcHaloMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    this.pcHalo = new THREE.Mesh(pcHaloGeo, pcHaloMat);
    this.pcHalo.rotation.x = -Math.PI / 2;
    this.pcHalo.position.set(0, 0.05, 0);
    pcGroup.add(this.pcHalo);

    this.group.add(pcGroup);
    this.nodes['lexer'] = pcGroup;
    this.nodes['path'] = pcGroup;

    this.sceneManager.registerInteractiveObject(bezel, {
      id: 'terminal',
      title: '🖥️ Terminal Display & PTY Master',
      layer: 'User Space',
      summary: 'Captures keyboard events and prints text output to your screen.',
      details: 'Applications like GNOME Terminal, Alacritty, or VS Code write raw keyboard bytes into the pseudoterminal master device (/dev/ptmx).'
    });

    this.sceneManager.registerInteractiveObject(towerMesh, {
      id: 'lexer',
      title: '🐚 Shell Parser & $PATH Finder',
      layer: 'User Space (Bash/Zsh)',
      summary: 'Reads command text, checks aliases, and searches $PATH folders (/usr/bin) to find the program.',
      details: 'Bash tokenizes the command into arguments, evaluates variables ($HOME), and checks if the command exists on disk.'
    });

    // Initialize screen
    this.updateMonitorScreen('ls -la', ['drwxr-xr-x 5 user user 4096 Aug 28 src', '-rw-r--r-- 1 user user  320 package.json', 'user@linux:~$ ']);
  }

  updateMonitorScreen(cmdText, outputLines = [], activeStep = '') {
    const ctx = this.screenCtx;
    if (!ctx) return;

    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, 512, 340);

    // Window header
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 32);

    // Window buttons
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(16, 16, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(32, 16, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(48, 16, 5, 0, Math.PI * 2); ctx.fill();

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('bash — 3D Computer Terminal', 70, 21);

    // Prompt & Typed Command
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('user@linux:~$ ', 18, 64);

    ctx.fillStyle = '#00f3ff';
    ctx.fillText(cmdText || 'ls -la', 142, 64);

    // Active status line
    if (activeStep) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`⚡ Status: ${activeStep}`, 18, 94);
    }

    // Terminal Outputs
    ctx.font = '12px monospace';
    ctx.fillStyle = '#cbd5e1';
    let y = activeStep ? 122 : 98;
    for (let i = 0; i < Math.min(8, outputLines.length); i++) {
      ctx.fillText(outputLines[i], 18, y);
      y += 22;
    }

    this.screenTexture.needsUpdate = true;
  }

  highlightNode(nodeId, active = true, colorHex = 0x00f3ff) {
    if (nodeId === 'terminal' && this.termHalo) {
      this.termHalo.material.color.setHex(colorHex);
      this.termHalo.material.opacity = active ? 0.9 : 0;
    } else if ((nodeId === 'lexer' || nodeId === 'path') && this.pcHalo) {
      this.pcHalo.material.color.setHex(colorHex);
      this.pcHalo.material.opacity = active ? 0.9 : 0;
    }
  }

  update(delta) {}
}
