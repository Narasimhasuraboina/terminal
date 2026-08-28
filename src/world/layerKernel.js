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
    // 1. Realistic CPU Chip & LGA Socket
    const cpuGroup = new THREE.Group();
    cpuGroup.position.set(-5.5, 0, 1.5);

    // Silicon Substrate PCB
    const substrate = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.3, 5.8),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3, metalness: 0.2 })
    );
    substrate.position.y = 0.15;
    cpuGroup.add(substrate);

    // Nickel Plated Copper IHS
    const ihsMat = new THREE.MeshStandardMaterial({
      color: 0xa0aec0,
      metalness: 0.95,
      roughness: 0.15
    });
    const ihs = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.45, 4.8), ihsMat);
    ihs.position.y = 0.52;
    cpuGroup.add(ihs);

    // Laser Engraved CPU Face
    const cpuCanvas = document.createElement('canvas');
    cpuCanvas.width = 256;
    cpuCanvas.height = 256;
    const cCtx = cpuCanvas.getContext('2d');
    cCtx.fillStyle = '#94a3b8';
    cCtx.fillRect(0, 0, 256, 256);
    cCtx.fillStyle = '#0f172a';
    cCtx.font = 'bold 24px monospace';
    cCtx.textAlign = 'center';
    cCtx.fillText('x86_64 CPU CORE', 128, 80);
    cCtx.font = 'bold 16px monospace';
    cCtx.fillText('Ring 0 / CFS Scheduler', 128, 125);
    cCtx.fillText('Registers: RAX | RIP | CR3', 128, 160);
    cCtx.font = '13px monospace';
    cCtx.fillText('4.8 GHz Quad-Core', 128, 200);

    const cpuTex = new THREE.CanvasTexture(cpuCanvas);
    const cpuLabelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 4.5),
      new THREE.MeshBasicMaterial({ map: cpuTex })
    );
    cpuLabelPlane.rotation.x = -Math.PI / 2;
    cpuLabelPlane.position.y = 0.76;
    cpuGroup.add(cpuLabelPlane);

    // CPU Underglow Ring
    const cpuHalo = new THREE.Mesh(
      new THREE.RingGeometry(3.2, 3.8, 32),
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
      title: '🧠 CPU Core & Hardware Registers',
      layer: 'Hardware Execution',
      summary: 'Executes the compiled machine code instructions in Ring 0 or Ring 3.',
      details: 'Registers (RAX, RIP, RSP, RDI) hold active instruction addresses, syscall parameters, and return codes.'
    });

    // 2. Dual-Channel DDR5 RAM Sticks
    const ramGroup = new THREE.Group();
    ramGroup.position.set(5.5, 0, 1.5);

    for (let slot = 0; slot < 2; slot++) {
      const zOffset = (slot - 0.5) * 3.0;

      const socketSlot = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.35, 7.8),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 })
      );
      socketSlot.position.set(0, 0.18, zOffset);
      ramGroup.add(socketSlot);

      const ramStick = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 3.0, 7.4),
        new THREE.MeshStandardMaterial({
          color: 0x141c2b,
          metalness: 0.8,
          roughness: 0.25
        })
      );
      ramStick.position.set(0, 1.68, zOffset);
      ramGroup.add(ramStick);

      for (let chip = 0; chip < 4; chip++) {
        const chipMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 1.2, 1.2),
          new THREE.MeshStandardMaterial({ color: 0x070a12, roughness: 0.2 })
        );
        chipMesh.position.set(0, 1.7, zOffset - 2.4 + chip * 1.6);
        ramGroup.add(chipMesh);
      }

      const ramRgb = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.25, 7.4),
        new THREE.MeshBasicMaterial({ color: 0x00f3ff })
      );
      ramRgb.position.set(0, 3.2, zOffset);
      ramGroup.add(ramRgb);
    }

    // RAM Underglow Ring
    const ramHalo = new THREE.Mesh(
      new THREE.RingGeometry(3.0, 3.6, 32),
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
      title: '📦 Physical RAM & Virtual Memory (MMU)',
      layer: 'Kernel Memory Management',
      summary: 'Holds the program code (.text), variables (.data), heap, stack, and kernel Page Cache.',
      details: 'The MMU hardware translates virtual addresses to physical RAM chips using 4-Level Page Tables.'
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
