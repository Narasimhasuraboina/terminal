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
    // ==========================================
    // 1. REALISTIC WORKSTATION DESK
    // ==========================================
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(16, 0.45, 9.6),
      new THREE.MeshStandardMaterial({ color: 0x0a101d, metalness: 0.8, roughness: 0.35 })
    );
    deskTop.position.set(0, 1.0, 0);
    this.group.add(deskTop);

    // Heavy Industrial Steel Desk Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.15 });
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.0, 8.4), legMat);
    leg1.position.set(-7.2, 0, 0);
    this.group.add(leg1);
    const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.0, 8.4), legMat);
    leg2.position.set(7.2, 0, 0);
    this.group.add(leg2);

    // ==========================================
    // 2. ULTRA-WIDE CURVED 34" WORKSTATION MONITOR
    // ==========================================
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(-2.5, 1.2, 0);

    // Aluminum Desk Clamp & Monitor Arm Base
    const standBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 0.18, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.2 })
    );
    standBase.position.y = 0.09;
    monitorGroup.add(standBase);

    // Articulated Monitor Arm Pillar
    const standPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.22, 2.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.92, roughness: 0.2 })
    );
    standPole.position.set(0, 1.25, -0.4);
    monitorGroup.add(standPole);

    // Monitor Bezel Chassis (Curved Matte Black Magnesium Alloy)
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x050912,
      metalness: 0.9,
      roughness: 0.25
    });
    const bezel = new THREE.Mesh(new THREE.BoxGeometry(7.2, 4.0, 0.28), bezelMat);
    bezel.position.set(0, 3.2, 0);
    monitorGroup.add(bezel);

    // Power Indicator LED
    const pwrLed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.05, 12),
      new THREE.MeshBasicMaterial({ color: 0x00f3ff })
    );
    pwrLed.rotation.x = Math.PI / 2;
    pwrLed.position.set(3.2, 1.35, 0.15);
    monitorGroup.add(pwrLed);

    // Dynamic Live High-Resolution Monospace Screen Face (1024x680 Retina)
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 1024;
    this.screenCanvas.height = 680;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 3.6),
      new THREE.MeshBasicMaterial({ map: this.screenTexture })
    );
    screenMesh.position.set(0, 3.2, 0.15);
    monitorGroup.add(screenMesh);

    // Under-glow ring spotlight for active highlighting
    const haloGeo = new THREE.RingGeometry(2.4, 3.0, 32);
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

    // ==========================================
    // 3. MECHANICAL KEYBOARD & MOUSEPAD
    // ==========================================
    // Extended Desk Mat
    const deskMat = new THREE.Mesh(
      new THREE.BoxGeometry(10.0, 0.04, 4.2),
      new THREE.MeshStandardMaterial({ color: 0x090e18, roughness: 0.8, metalness: 0.1 })
    );
    deskMat.position.set(-1.0, 1.24, 2.2);
    this.group.add(deskMat);

    // Keyboard Aluminum Frame
    const kbBase = new THREE.Mesh(
      new THREE.BoxGeometry(5.4, 0.18, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
    );
    kbBase.position.set(-2.5, 1.35, 2.3);
    this.group.add(kbBase);

    // Individual Keycap Row Clusters
    const keyMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.5, metalness: 0.2 });
    for (let r = 0; r < 4; r++) {
      const keyRow = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.12, 0.35), keyMat);
      keyRow.position.set(-2.5, 1.48, 1.7 + r * 0.42);
      this.group.add(keyRow);
    }

    // Ergonomic Gaming Mouse
    const mouseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 });
    const mouseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.35, 1.3), mouseMat);
    mouseMesh.position.set(2.2, 1.36, 2.4);
    this.group.add(mouseMesh);

    // ==========================================
    // 4. PHOTOREALISTIC ATX TOWER PC CHASSIS (SHELL / $PATH)
    // ==========================================
    const pcGroup = new THREE.Group();
    pcGroup.position.set(5.2, 1.2, 0);

    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x050912,
      metalness: 0.9,
      roughness: 0.25
    });
    const towerMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 5.4, 5.0), towerMat);
    towerMesh.position.y = 2.7;
    pcGroup.add(towerMesh);

    // Tempered Smoked Glass Side Panel
    const glassMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 5.0),
      new THREE.MeshPhysicalMaterial({
        color: 0x00f3ff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.85,
        transparent: true,
        opacity: 0.35
      })
    );
    glassMesh.rotation.y = -Math.PI / 2;
    glassMesh.position.set(-1.61, 2.7, 0);
    pcGroup.add(glassMesh);

    // Front Honeycomb Air Intake Grille
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.9, metalness: 0.1 });
    const frontGrille = new THREE.Mesh(new THREE.BoxGeometry(3.0, 4.8, 0.1), grilleMat);
    frontGrille.position.set(0, 2.7, 2.55);
    pcGroup.add(frontGrille);

    // Internal Motherboard & Dual GPU Fans (visible through glass)
    const innerGpu = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.6, 3.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85 })
    );
    innerGpu.position.set(0.2, 2.5, 0);
    pcGroup.add(innerGpu);

    // Front RGB Accent Line
    const frontRgb = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 4.8, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x00f3ff })
    );
    frontRgb.position.set(-1.52, 2.7, 2.56);
    pcGroup.add(frontRgb);

    // PC Under-glow ring
    const pcHaloGeo = new THREE.RingGeometry(2.2, 2.8, 32);
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
      title: '🖥️ Workstation Terminal Display & PTY Master',
      layer: 'User Space (Ring 3)',
      summary: 'Captures keyboard events and prints text output to your screen.',
      details: 'Applications like GNOME Terminal, Alacritty, or VS Code write raw keyboard bytes into the pseudoterminal master device (/dev/ptmx).'
    });

    this.sceneManager.registerInteractiveObject(towerMesh, {
      id: 'lexer',
      title: '🐚 Shell Parser & $PATH Finder (Bash/Zsh)',
      layer: 'User Space (Ring 3)',
      summary: 'Reads command text, checks aliases, and searches $PATH folders (/usr/bin) to find the program.',
      details: 'Bash tokenizes the command into arguments, evaluates variables ($HOME), and checks if the command exists on disk.'
    });

    // Initialize screen
    this.updateMonitorScreen('ls -la', ['drwxr-xr-x 5 user user 4096 Aug 28 src', '-rw-r--r-- 1 user user  320 package.json', 'user@linux:~$ ']);
  }

  updateMonitorScreen(cmdText, outputLines = [], activeStep = '', whyReason = '') {
    const ctx = this.screenCtx;
    if (!ctx) return;

    // High-Resolution 1024x680 Screen Buffer
    ctx.fillStyle = '#040711';
    ctx.fillRect(0, 0, 1024, 680);

    // Window Title Bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1024, 56);

    // Window traffic lights
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(30, 28, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(60, 28, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(90, 28, 9, 0, Math.PI * 2); ctx.fill();

    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('bash — 3D Linux Terminal Emulator', 130, 36);

    // Active Command Prompt
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('user@linux:~$ ', 36, 110);

    ctx.fillStyle = '#00f3ff';
    ctx.fillText(cmdText || 'ls -la', 280, 110);

    // Active Status Headline
    if (activeStep) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`⚡ Status: ${activeStep}`, 36, 160);
    }

    // Why at this point Callout Box on 3D Monitor
    if (whyReason) {
      ctx.fillStyle = 'rgba(14, 165, 233, 0.18)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(32, 190, 960, 110, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('❓ WHY AT THIS HARDWARE POINT:', 50, 230);

      ctx.fillStyle = '#f0f9ff';
      ctx.font = '20px sans-serif';
      const cleanReason = whyReason.length > 80 ? whyReason.substring(0, 78) + '...' : whyReason;
      ctx.fillText(cleanReason, 50, 272);
    }

    // Output Lines
    ctx.font = '22px monospace';
    ctx.fillStyle = '#cbd5e1';
    let y = whyReason ? 345 : (activeStep ? 220 : 170);
    for (let i = 0; i < Math.min(6, outputLines.length); i++) {
      ctx.fillText(outputLines[i], 36, y);
      y += 38;
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
