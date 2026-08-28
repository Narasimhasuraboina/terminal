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
    const baseGeo = new THREE.BoxGeometry(24, 1.2, 22);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0a1424,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x0044ff,
      emissiveIntensity: 0.25
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.6;
    this.group.add(baseMesh);

    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x2979ff, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.6;
    this.group.add(edgeLines);

    this.createHoloLabel('🧠 STEP 3: CPU & RAM (KERNEL MEMORY)', new THREE.Vector3(0, 13, -9), 0x2979ff, '#2979ff');
  }

  createHoloLabel(text, pos, colorHex, borderHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 130;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(6, 16, 36, 0.92)';
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

  buildHardwareModels() {
    // 1. Realistic CPU Chip & Socket
    const cpuGroup = new THREE.Group();
    cpuGroup.position.set(-6, 0, 2);

    // Green PCB Substrate
    const pcb = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 0.4, 6.5),
      new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.3 })
    );
    pcb.position.y = 0.2;
    cpuGroup.add(pcb);

    // Silver Integrated Heat Spreader (IHS)
    const ihs = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.6, 5.2),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.95,
        roughness: 0.1,
        emissive: 0x00f3ff,
        emissiveIntensity: 0.25
      })
    );
    ihs.position.y = 0.7;
    cpuGroup.add(ihs);

    // CPU Label on top of heat spreader
    const cpuCanvas = document.createElement('canvas');
    cpuCanvas.width = 256;
    cpuCanvas.height = 256;
    const cCtx = cpuCanvas.getContext('2d');
    cCtx.fillStyle = '#94a3b8';
    cCtx.fillRect(0, 0, 256, 256);
    cCtx.fillStyle = '#0f172a';
    cCtx.font = 'bold 26px monospace';
    cCtx.textAlign = 'center';
    cCtx.fillText('x86-64 CPU', 128, 100);
    cCtx.font = '18px monospace';
    cCtx.fillText('Ring 0 / CFS', 128, 140);
    cCtx.fillText('Registers RAX/RIP', 128, 180);

    const cpuTex = new THREE.CanvasTexture(cpuCanvas);
    const cpuLabelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 4.8),
      new THREE.MeshBasicMaterial({ map: cpuTex })
    );
    cpuLabelPlane.rotation.x = -Math.PI / 2;
    cpuLabelPlane.position.y = 1.02;
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

    // 2. Realistic Dual RAM DIMM Sticks (Memory Module)
    const ramGroup = new THREE.Group();
    ramGroup.position.set(6, 0, 2);

    for (let slot = 0; slot < 2; slot++) {
      const zOffset = (slot - 0.5) * 3.5;

      // Blue/Black RAM PCB
      const ramStick = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 3.8, 8),
        new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          emissive: 0x2563eb,
          emissiveIntensity: 0.25,
          metalness: 0.8
        })
      );
      ramStick.position.set(0, 2, zOffset);
      ramGroup.add(ramStick);

      // Memory Chip packages (Black blocks on the stick)
      for (let chip = 0; chip < 4; chip++) {
        const chipMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, 1.8, 1.4),
          new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.2 })
        );
        chipMesh.position.set(0, 2, zOffset - 2.8 + chip * 1.9);
        ramGroup.add(chipMesh);
      }
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
      node.scale.set(1.15, 1.15, 1.15);
      if (node.material && node.material.emissive) {
        node.material.emissive.setHex(colorHex);
        node.material.emissiveIntensity = 0.95;
      }
    } else {
      node.scale.set(1, 1, 1);
      if (node.material && node.material.emissive) {
        node.material.emissiveIntensity = 0.25;
      }
    }
  }

  update(delta) {}
}
