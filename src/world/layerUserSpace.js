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
    const baseGeo = new THREE.BoxGeometry(22, 0.8, 20);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x06111f,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x002244,
      emissiveIntensity: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.4;
    this.group.add(baseMesh);

    // Glowing cyan edge line
    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00f3ff, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.4;
    this.group.add(edgeLines);

    // Floating Platform Label
    this.createHoloLabel('🖥️ STEP 1: USER TERMINAL & SHELL', new THREE.Vector3(0, 10.5, -7.5), 0x00f3ff, '#00f3ff');
  }

  createHoloLabel(text, pos, colorHex, borderHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(4, 10, 24, 0.9)';
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

  buildHardwareModels() {
    // 1. Workstation Desk
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      metalness: 0.8,
      roughness: 0.25
    });
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(16, 0.5, 10), deskMat);
    deskTop.position.set(0, 1.2, 0);
    this.group.add(deskTop);

    // Desk Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.1 });
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.4, 16), legMat);
    leg1.position.set(-7, 0, -4);
    this.group.add(leg1);
    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.4, 16), legMat);
    leg2.position.set(7, 0, -4);
    this.group.add(leg2);

    // 2. Realistic 27" Desktop Monitor
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(-2.5, 1.45, 0);

    // Monitor Stand Base & Arm
    const standBase = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.8, 0.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.95, roughness: 0.1 })
    );
    standBase.position.y = 0.1;
    monitorGroup.add(standBase);

    const standPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 2.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 })
    );
    standPole.position.set(0, 1.3, -0.3);
    monitorGroup.add(standPole);

    // Monitor Bezel Frame
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 4.4, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x070b14, metalness: 0.85, roughness: 0.2 })
    );
    bezel.position.set(0, 3.6, 0);
    monitorGroup.add(bezel);

    // Monitor Screen Canvas
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 512;
    this.screenCanvas.height = 360;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.0, 4.0),
      new THREE.MeshBasicMaterial({ map: this.screenTexture })
    );
    screenMesh.position.set(0, 3.6, 0.16);
    monitorGroup.add(screenMesh);

    this.group.add(monitorGroup);
    this.nodes['terminal'] = bezel;

    // 3. Mechanical Keyboard on Desk
    const kbBase = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.25, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 })
    );
    kbBase.position.set(-2.5, 1.55, 2.8);
    this.group.add(kbBase);

    // Keyboard RGB backplate
    const kbRgb = new THREE.Mesh(
      new THREE.PlaneGeometry(5.0, 1.8),
      new THREE.MeshBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.45 })
    );
    kbRgb.rotation.x = -Math.PI / 2;
    kbRgb.position.set(-2.5, 1.69, 2.8);
    this.group.add(kbRgb);

    // 4. Gaming PC Desktop Tower (Shell / $PATH Station)
    const pcGroup = new THREE.Group();
    pcGroup.position.set(5.0, 1.45, 0);

    // Main Chassis
    const towerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 5.8, 5.4),
      new THREE.MeshStandardMaterial({
        color: 0x070d1a,
        metalness: 0.9,
        roughness: 0.15,
        emissive: 0x00f3ff,
        emissiveIntensity: 0.1
      })
    );
    towerMesh.position.y = 2.9;
    pcGroup.add(towerMesh);

    // Tempered Glass Side Window
    const glassMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.0, 5.4),
      new THREE.MeshStandardMaterial({
        color: 0x00f3ff,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.35
      })
    );
    glassMesh.rotation.y = -Math.PI / 2;
    glassMesh.position.set(-1.72, 2.9, 0);
    pcGroup.add(glassMesh);

    // Front RGB Accent Strip
    const frontRgb = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 5.0, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x00ff88 })
    );
    frontRgb.position.set(-1.6, 2.9, 2.6);
    pcGroup.add(frontRgb);

    this.group.add(pcGroup);
    this.nodes['lexer'] = towerMesh;
    this.nodes['path'] = towerMesh;

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

    // Initialize screen content
    this.updateMonitorScreen('ls -la', ['drwxr-xr-x 5 user user 4096 Aug 28 src', '-rw-r--r-- 1 user user  320 package.json', 'user@linux:~$ ']);
  }

  updateMonitorScreen(cmdText, outputLines = [], activeStep = '') {
    const ctx = this.screenCtx;
    if (!ctx) return;

    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, 512, 360);

    // Window header
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 34);

    // Window control buttons
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(16, 17, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(32, 17, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(48, 17, 5, 0, Math.PI * 2); ctx.fill();

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('bash — 3D Computer Terminal', 70, 22);

    // Prompt line
    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('user@linux:~$ ', 18, 68);

    ctx.fillStyle = '#00f3ff';
    ctx.fillText(cmdText || 'ls -la', 142, 68);

    // Active status line
    if (activeStep) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`⚡ Status: ${activeStep}`, 18, 98);
    }

    // Terminal Outputs
    ctx.font = '12.5px monospace';
    ctx.fillStyle = '#cbd5e1';
    let y = activeStep ? 126 : 102;
    for (let i = 0; i < Math.min(8, outputLines.length); i++) {
      ctx.fillText(outputLines[i], 18, y);
      y += 22;
    }

    this.screenTexture.needsUpdate = true;
  }

  highlightNode(nodeId, active = true, colorHex = 0x00f3ff) {
    const node = this.nodes[nodeId];
    if (!node) return;

    if (active) {
      node.scale.set(1.08, 1.08, 1.08);
      if (node.material && node.material.emissive) {
        node.material.emissive.setHex(colorHex);
        node.material.emissiveIntensity = 0.9;
      }
    } else {
      node.scale.set(1, 1, 1);
      if (node.material && node.material.emissive) {
        node.material.emissiveIntensity = 0.1;
      }
    }
  }

  update(delta) {}
}
