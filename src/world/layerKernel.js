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
    const baseGeo = new THREE.BoxGeometry(24, 0.8, 22);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0a1424,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x0044ff,
      emissiveIntensity: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.4;
    this.group.add(baseMesh);

    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x2979ff, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.4;
    this.group.add(edgeLines);

    this.createHoloLabel('🧠 STEP 3: CPU & RAM (KERNEL MEMORY)', new THREE.Vector3(0, 10.5, -7.5), 0x2979ff, '#2979ff');
  }

  createHoloLabel(text, pos, colorHex, borderHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(6, 16, 36, 0.9)';
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
    // 1. Realistic CPU Chip & LGA Socket
    const cpuGroup = new THREE.Group();
    cpuGroup.position.set(-5.5, 0, 1.5);

    // Green Silicon Substrate PCB
    const substrate = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.35, 6.2),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3, metalness: 0.2 })
    );
    substrate.position.y = 0.2;
    cpuGroup.add(substrate);

    // Nickel Plated Copper IHS (Integrated Heat Spreader)
    const ihsMat = new THREE.MeshStandardMaterial({
      color: 0xa0aec0,
      metalness: 0.95,
      roughness: 0.15,
      emissive: 0x00f3ff,
      emissiveIntensity: 0.15
    });
    const ihs = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.5, 5.0), ihsMat);
    ihs.position.y = 0.6;
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
      new THREE.PlaneGeometry(4.7, 4.7),
      new THREE.MeshBasicMaterial({ map: cpuTex })
    );
    cpuLabelPlane.rotation.x = -Math.PI / 2;
    cpuLabelPlane.position.y = 0.86;
    cpuGroup.add(cpuLabelPlane);

    this.group.add(cpuGroup);
    this.nodes['cpu_core'] = ihs;
    this.nodes['scheduler'] = ihs;

    this.sceneManager.registerInteractiveObject(ihs, {
      id: 'cpu_core',
      title: '🧠 CPU Core & Hardware Registers',
      layer: 'Hardware Execution',
      summary: 'Executes the compiled machine code instructions in Ring 0 or Ring 3.',
      details: 'Registers (RAX, RIP, RSP, RDI) hold active instruction addresses, syscall parameters, and return codes.'
    });

    // 2. Realistic Dual-Channel DDR5 RAM Sticks
    const ramGroup = new THREE.Group();
    ramGroup.position.set(5.5, 0, 1.5);

    for (let slot = 0; slot < 2; slot++) {
      const zOffset = (slot - 0.5) * 3.2;

      // RAM Motherboard Socket Slot
      const socketSlot = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.4, 8.4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 })
      );
      socketSlot.position.set(0, 0.2, zOffset);
      ramGroup.add(socketSlot);

      // Matte Black RAM PCB
      const ramStick = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 3.4, 7.8),
        new THREE.MeshStandardMaterial({
          color: 0x182030,
          emissive: 0x2563eb,
          emissiveIntensity: 0.2,
          metalness: 0.8,
          roughness: 0.2
        })
      );
      ramStick.position.set(0, 1.9, zOffset);
      ramGroup.add(ramStick);

      // Discrete DRAM Black Memory Chips
      for (let chip = 0; chip < 4; chip++) {
        const chipMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 1.4, 1.3),
          new THREE.MeshStandardMaterial({ color: 0x070a12, roughness: 0.15 })
        );
        chipMesh.position.set(0, 2.0, zOffset - 2.5 + chip * 1.7);
        ramGroup.add(chipMesh);
      }

      // Top RGB Heat-Spreader Light Bar
      const ramRgb = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.3, 7.8),
        new THREE.MeshBasicMaterial({ color: 0x00f3ff })
      );
      ramRgb.position.set(0, 3.65, zOffset);
      ramGroup.add(ramRgb);
    }

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
    const node = this.nodes[nodeId];
    if (!node) return;

    if (active) {
      node.scale.set(1.08, 1.08, 1.08);
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
