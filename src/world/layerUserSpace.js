import * as THREE from 'three';

export class LayerUserSpace {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.group = new THREE.Group();
    this.group.position.set(-38, 0, 10);
    this.scene.add(this.group);

    this.nodes = {};
    this.buildPlatform();
    this.buildHardwareModels();
  }

  buildPlatform() {
    // Motherboard PCB Base
    const baseGeo = new THREE.BoxGeometry(24, 1.2, 22);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x071524,
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x003366,
      emissiveIntensity: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.6;
    this.group.add(baseMesh);

    // Glowing border
    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00f3ff, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.6;
    this.group.add(edgeLines);

    // Permanent High-Contrast Billboard Label
    this.createHoloLabel('🖥️ STEP 1: USER TERMINAL & SHELL', new THREE.Vector3(0, 13, -8), 0x00f3ff, '#00f3ff');
  }

  createHoloLabel(text, pos, colorHex, borderHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 130;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(4, 10, 24, 0.92)';
    ctx.roundRect(10, 10, 580, 110, 18);
    ctx.fill();
    ctx.strokeStyle = borderHex;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.font = 'bold 30px system-ui, sans-serif';
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

  buildHardwareModels() {
    // 1. Realistic Computer Desk
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
    );
    deskTop.position.set(0, 1.5, 0);
    this.group.add(deskTop);

    // 2. Realistic Desktop Monitor (Live Screen)
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(-3, 1.8, 0);

    // Stand
    const standBase = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.4, 0.3, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
    );
    standBase.position.y = 0.15;
    monitorGroup.add(standBase);

    const standPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 2.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    standPole.position.set(0, 1.6, -0.4);
    monitorGroup.add(standPole);

    // Screen bezel
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(8, 5.6, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.8, roughness: 0.2 })
    );
    bezel.position.set(0, 4.4, 0);
    monitorGroup.add(bezel);

    // Live Dynamic Canvas Screen
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 512;
    this.screenCanvas.height = 360;
    this.screenCtx = this.screenCanvas.getContext('2d');
    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);

    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(7.4, 5.0),
      new THREE.MeshBasicMaterial({ map: this.screenTexture })
    );
    screenMesh.position.set(0, 4.4, 0.21);
    monitorGroup.add(screenMesh);

    this.group.add(monitorGroup);
    this.nodes['terminal'] = bezel;

    // 3. Realistic Keyboard on desk
    const keyboard = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 0.3, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 })
    );
    keyboard.position.set(-3, 1.95, 3.5);
    keyboard.rotation.x = 0.05;
    this.group.add(keyboard);

    // 4. Desktop Computer PC Tower (Shell & $PATH Station)
    const pcTower = new THREE.Mesh(
      new THREE.BoxGeometry(4, 7, 6.5),
      new THREE.MeshStandardMaterial({
        color: 0x111c30,
        emissive: 0x00f3ff,
        emissiveIntensity: 0.2,
        metalness: 0.8,
        roughness: 0.2
      })
    );
    pcTower.position.set(6, 4.8, 0);
    this.group.add(pcTower);

    // Glowing front LED strip
    const ledStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 5.6, 0.2),
      new THREE.MeshBasicMaterial({ color: 0x00ff88 })
    );
    ledStrip.position.set(-2.01, 0, 3.1);
    pcTower.add(ledStrip);

    this.nodes['lexer'] = pcTower;
    this.nodes['path'] = pcTower;

    this.sceneManager.registerInteractiveObject(bezel, {
      id: 'terminal',
      title: '🖥️ Terminal Display & PTY Master',
      layer: 'User Space',
      summary: 'Captures keyboard events and prints text output to your screen.',
      details: 'Applications like GNOME Terminal, Alacritty, or VS Code write raw keyboard bytes into the pseudoterminal master device (/dev/ptmx).'
    });

    this.sceneManager.registerInteractiveObject(pcTower, {
      id: 'lexer',
      title: '🐚 Shell Parser & $PATH Finder',
      layer: 'User Space (Bash/Zsh)',
      summary: 'Reads command text, checks aliases, and searches $PATH folders (/usr/bin) to find the program.',
      details: 'Bash tokenizes the command into arguments, evaluates variables ($HOME), and checks if the command exists on disk.'
    });

    // Initialize screen with initial welcome text
    this.updateMonitorScreen('ls -la', ['drwxr-xr-x 5 user user 4096 Aug 28 src', '-rw-r--r-- 1 user user  320 package.json', 'user@linux:~$ ']);
  }

  updateMonitorScreen(cmdText, outputLines = [], activeStep = '') {
    const ctx = this.screenCtx;
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#050a14';
    ctx.fillRect(0, 0, 512, 360);

    // Terminal top header bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 36);

    // Window control buttons
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(18, 18, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.arc(36, 18, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath(); ctx.arc(54, 18, 6, 0, Math.PI * 2); ctx.fill();

    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('bash — 3D Computer Terminal', 80, 23);

    // Prompt & Typed Command
    ctx.font = '16px monospace';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('user@linux:~$ ', 20, 70);

    ctx.fillStyle = '#00f3ff';
    ctx.fillText(cmdText || 'ls -la', 150, 70);

    // Cursor
    const cursorX = 150 + ctx.measureText(cmdText || 'ls -la').width + 2;
    ctx.fillStyle = '#00f3ff';
    ctx.fillRect(cursorX, 56, 10, 16);

    // Active status line
    if (activeStep) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = '13px monospace';
      ctx.fillText(`⚡ Status: ${activeStep}`, 20, 105);
    }

    // Terminal Outputs
    ctx.font = '13px monospace';
    ctx.fillStyle = '#cbd5e1';
    let y = activeStep ? 135 : 110;
    for (let i = 0; i < Math.min(8, outputLines.length); i++) {
      ctx.fillText(outputLines[i], 20, y);
      y += 24;
    }

    this.screenTexture.needsUpdate = true;
  }

  highlightNode(nodeId, active = true, colorHex = 0x00f3ff) {
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

  update(delta) {}
}
