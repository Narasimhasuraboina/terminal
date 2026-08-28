import * as THREE from 'three';

export class LayerKernel {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.group = new THREE.Group();
    this.group.position.set(16, 0, -4);
    this.scene.add(this.group);

    this.nodes = {};
    this.buildPlatform();
    this.buildHardwareModels();
  }

  buildPlatform() {
    const baseGeo = new THREE.BoxGeometry(24, 0.6, 20);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x08101e,
      metalness: 0.9,
      roughness: 0.3
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.3;
    this.group.add(baseMesh);

    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x2979ff, transparent: true, opacity: 0.6 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.3;
    this.group.add(edgeLines);
  }

  buildHardwareModels() {
    // ==========================================
    // 1. PHOTOREALISTIC CPU & LGA SOCKET
    // ==========================================
    const cpuGroup = new THREE.Group();
    cpuGroup.position.set(-5.5, 0, 1.5);

    // Dark Matte FR4 Motherboard Substrate with Gold Traces
    const substrateMat = new THREE.MeshStandardMaterial({
      color: 0x071e16,
      roughness: 0.35,
      metalness: 0.3
    });
    const substrate = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.35, 6.4), substrateMat);
    substrate.position.y = 0.18;
    cpuGroup.add(substrate);

    // LGA Socket Metal Frame & Bracket
    const socketFrameMat = new THREE.MeshStandardMaterial({
      color: 0x2d3748,
      metalness: 0.9,
      roughness: 0.2
    });
    const socketFrame = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.25, 6.0), socketFrameMat);
    socketFrame.position.y = 0.36;
    cpuGroup.add(socketFrame);

    // Socket Lever (Nickel-plated locking arm)
    const leverMat = new THREE.MeshStandardMaterial({ color: 0xc0c8d0, metalness: 0.95, roughness: 0.1 });
    const lever = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.2, 12), leverMat);
    lever.rotation.x = Math.PI / 2;
    lever.position.set(3.1, 0.45, 0);
    cpuGroup.add(lever);

    // Gold Pin Alignment Corner Marker
    const goldMarker = new THREE.Mesh(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-2.8, 0.5, -2.8),
        new THREE.Vector3(-2.2, 0.5, -2.8),
        new THREE.Vector3(-2.8, 0.5, -2.2)
      ]),
      new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide })
    );
    cpuGroup.add(goldMarker);

    // Surface Mount Decoupling Capacitors (SMD 0402 Array)
    const capMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4, metalness: 0.6 });
    for (let x = -2.6; x <= 2.6; x += 1.3) {
      for (let z = -2.6; z <= 2.6; z += 1.3) {
        if (Math.abs(x) > 2.0 || Math.abs(z) > 2.0) {
          const cap = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.2), capMat);
          cap.position.set(x, 0.48, z);
          cpuGroup.add(cap);
        }
      }
    }

    // Nickel Plated Copper Integrated Heat Spreader (IHS)
    const ihsMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.95,
      roughness: 0.18
    });
    const ihs = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.42, 4.8), ihsMat);
    ihs.position.y = 0.68;
    cpuGroup.add(ihs);

    // High-Res Laser-Engraved CPU Face Texture
    const cpuCanvas = document.createElement('canvas');
    cpuCanvas.width = 512;
    cpuCanvas.height = 512;
    const cCtx = cpuCanvas.getContext('2d');

    // Brushed metal base
    cCtx.fillStyle = '#b0b8c4';
    cCtx.fillRect(0, 0, 512, 512);

    // Brushed metal lines
    cCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    cCtx.lineWidth = 1;
    for (let i = 0; i < 512; i += 3) {
      cCtx.beginPath();
      cCtx.moveTo(0, i);
      cCtx.lineTo(512, i);
      cCtx.stroke();
    }

    // Laser Engraving Details
    cCtx.fillStyle = '#1e293b';
    cCtx.textAlign = 'center';
    
    cCtx.font = 'bold 26px "Fira Code", monospace';
    cCtx.fillText('x86_64 OCTA-CORE PROCESSOR', 256, 120);

    cCtx.font = 'bold 20px "Fira Code", monospace';
    cCtx.fillStyle = '#334155';
    cCtx.fillText('HARDWARE RING 0 EXECUTION', 256, 175);

    cCtx.font = '16px "Fira Code", monospace';
    cCtx.fillText('4-Level Paging (CR3) • MMU Active', 256, 230);
    cCtx.fillText('CFS Scheduler • 5.2 GHz Max Turbo', 256, 275);
    cCtx.fillText('Registers: RAX | RDI | RSI | RIP | RSP', 256, 320);

    cCtx.font = 'bold 15px "Fira Code", monospace';
    cCtx.fillStyle = '#0f766e';
    cCtx.fillText('LINUX KERNEL SUBSYSTEM #0', 256, 380);

    // Corner notch & serial
    cCtx.font = '12px monospace';
    cCtx.fillStyle = '#64748b';
    cCtx.fillText('S/N: 2026-X86-64-LNX-PRO', 256, 440);

    const cpuTex = new THREE.CanvasTexture(cpuCanvas);
    const cpuLabelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.7, 4.7),
      new THREE.MeshStandardMaterial({
        map: cpuTex,
        metalness: 0.85,
        roughness: 0.25
      })
    );
    cpuLabelPlane.rotation.x = -Math.PI / 2;
    cpuLabelPlane.position.y = 0.90;
    cpuGroup.add(cpuLabelPlane);

    // CPU Underglow Ring
    const cpuHalo = new THREE.Mesh(
      new THREE.RingGeometry(3.3, 3.9, 32),
      new THREE.MeshBasicMaterial({ color: 0x2979ff, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    cpuHalo.rotation.x = -Math.PI / 2;
    cpuHalo.position.y = 0.05;
    cpuGroup.add(cpuHalo);
    this.cpuHalo = cpuHalo;

    this.group.add(cpuGroup);
    this.nodes['cpu_core'] = cpuGroup;
    this.nodes['scheduler'] = cpuGroup;

    this.sceneManager.registerInteractiveObject(ihs, {
      id: 'cpu_core',
      title: '🧠 x86_64 CPU Microprocessor Core',
      layer: 'Hardware Execution & Kernel Space (Ring 0)',
      summary: 'Physical hardware silicon die executing binary machine code instructions.',
      details: 'Executes instructions in Ring 0 (privileged) or Ring 3 (user sandbox). Hardware registers (RAX, RIP, CR3) control instruction flow and memory translation.'
    });

    // ==========================================
    // 2. REALISTIC DUAL-CHANNEL DDR5 RAM MODULES
    // ==========================================
    const ramGroup = new THREE.Group();
    ramGroup.position.set(5.5, 0, 1.5);

    // DIMM Socket Base Plate
    const dimmSocket = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.4, 8.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6 })
    );
    dimmSocket.position.set(0, 0.2, 0);
    ramGroup.add(dimmSocket);

    for (let slot = 0; slot < 2; slot++) {
      const zOffset = (slot - 0.5) * 3.4;

      // RAM PCB (Matte Black 10-Layer Board)
      const pcbMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.3, metalness: 0.5 });
      const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.6, 7.8), pcbMat);
      pcb.position.set(0, 1.5, zOffset);
      ramGroup.add(pcb);

      // Gold Contact Edge Pins (Bottom Connector)
      const goldPins = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.3, 7.6),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 })
      );
      goldPins.position.set(0, 0.35, zOffset);
      ramGroup.add(goldPins);

      // Anodized Aluminum Heat Spreader with Fin Cuts
      const heatSpreaderMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.2
      });
      const heatSpreader = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 7.6), heatSpreaderMat);
      heatSpreader.position.set(0, 1.75, zOffset);
      ramGroup.add(heatSpreader);

      // Heat Spreader Top Geometric Fins
      for (let fin = -3.2; fin <= 3.2; fin += 0.8) {
        const finMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.35, 0.4),
          heatSpreaderMat
        );
        finMesh.position.set(0, 2.95, zOffset + fin);
        ramGroup.add(finMesh);
      }

      // Memory Chips (BGA DDR5 ICs behind heat spreader)
      for (let chip = 0; chip < 4; chip++) {
        const chipMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.58, 1.1, 1.3),
          new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2, metalness: 0.4 })
        );
        chipMesh.position.set(0, 1.6, zOffset - 2.4 + chip * 1.6);
        ramGroup.add(chipMesh);
      }

      // Realistic DDR5 Branding Badge
      const ramBadgeCanvas = document.createElement('canvas');
      ramBadgeCanvas.width = 256;
      ramBadgeCanvas.height = 64;
      const bCtx = ramBadgeCanvas.getContext('2d');
      bCtx.fillStyle = '#0f172a';
      bCtx.fillRect(0, 0, 256, 64);
      bCtx.fillStyle = '#00f3ff';
      bCtx.font = 'bold 16px monospace';
      bCtx.fillText('DDR5 6400MHz 32GB', 16, 26);
      bCtx.fillStyle = '#94a3b8';
      bCtx.font = '12px monospace';
      bCtx.fillText('4-LEVEL VIRTUAL MMU', 16, 48);

      const badgeTex = new THREE.CanvasTexture(ramBadgeCanvas);
      const badgePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.01, 0.7),
        new THREE.MeshBasicMaterial({ map: badgeTex })
      );
      badgePlane.position.set(0.28, 1.9, zOffset);
      badgePlane.rotation.y = Math.PI / 2;
      badgePlane.scale.set(1, 1, 3.8);
      ramGroup.add(badgePlane);
    }

    // RAM Underglow Ring
    const ramHalo = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 3.8, 32),
      new THREE.MeshBasicMaterial({ color: 0x2979ff, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    ramHalo.rotation.x = -Math.PI / 2;
    ramHalo.position.y = 0.05;
    ramGroup.add(ramHalo);
    this.ramHalo = ramHalo;

    this.group.add(ramGroup);
    this.nodes['mmu_memory'] = ramGroup;

    this.sceneManager.registerInteractiveObject(ramGroup, {
      id: 'mmu_memory',
      title: '📦 DDR5 Physical RAM & MMU Virtual Memory',
      layer: 'Kernel Memory Management Subsystem',
      summary: 'High-speed physical RAM storing process segments (.text, .data, stack) and the Kernel Page Cache.',
      details: 'The hardware Memory Management Unit (MMU) translates virtual addresses to physical RAM chips using 4-Level Page Tables (PGD, P4D, PUD, PMD, PTE).'
    });
  }

  highlightNode(nodeId, active = true, colorHex = 0x2979ff) {
    if ((nodeId === 'cpu_core' || nodeId === 'scheduler') && this.cpuHalo) {
      this.cpuHalo.material.color.setHex(colorHex);
      this.cpuHalo.material.opacity = active ? 0.9 : 0;
    } else if (nodeId === 'mmu_memory' && this.ramHalo) {
      this.ramHalo.material.color.setHex(colorHex);
      this.ramHalo.material.opacity = active ? 0.9 : 0;
    }
  }

  update(delta) {}
}
