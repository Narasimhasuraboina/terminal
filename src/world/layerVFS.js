import * as THREE from 'three';

export class LayerVFS {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.group = new THREE.Group();
    this.group.position.set(40, 0, 10);
    this.scene.add(this.group);

    this.nodes = {};
    this.buildPlatform();
    this.buildHardwareModels();
  }

  buildPlatform() {
    const baseGeo = new THREE.BoxGeometry(22, 0.8, 20);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x061814,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x008855,
      emissiveIntensity: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.4;
    this.group.add(baseMesh);

    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.4;
    this.group.add(edgeLines);

    this.createHoloLabel('💾 STEP 4: NVMe SSD & FILE SYSTEM', new THREE.Vector3(0, 10.5, -7.5), 0x00ff88, '#00ff88');
  }

  createHoloLabel(text, pos, colorHex, borderHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(4, 24, 16, 0.9)';
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
    // 1. Realistic M.2 2280 NVMe SSD Stick
    const ssdGroup = new THREE.Group();
    ssdGroup.position.set(-4.0, 0, 1.5);

    // Matte Black M.2 PCB
    const ssdPcb = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.25, 7.8),
      new THREE.MeshStandardMaterial({ color: 0x07111a, roughness: 0.3, metalness: 0.4 })
    );
    ssdPcb.position.y = 0.15;
    ssdGroup.add(ssdPcb);

    // PCIe Gold Connector Pins at the edge
    const goldPins = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.28, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.1 })
    );
    goldPins.position.set(0, 0.15, 3.7);
    ssdGroup.add(goldPins);

    // High-Performance Flash Controller Chip (Silver Metal with Green Glow)
    const controller = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.45, 2.2),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0x00ff88,
        emissiveIntensity: 0.25,
        metalness: 0.9,
        roughness: 0.15
      })
    );
    controller.position.set(0, 0.4, -2.0);
    ssdGroup.add(controller);

    // 2x 3D TLC NAND Flash Memory Packages
    for (let i = 0; i < 2; i++) {
      const nand = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.4, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x050810, roughness: 0.2, metalness: 0.5 })
      );
      nand.position.set(0, 0.4, 0.6 + i * 2.2);
      ssdGroup.add(nand);
    }

    this.group.add(ssdGroup);
    this.nodes['vfs_tree'] = controller;
    this.nodes['page_cache'] = controller;
    this.nodes['storage_disk'] = controller;

    this.sceneManager.registerInteractiveObject(controller, {
      id: 'vfs_tree',
      title: '💾 NVMe SSD & VFS Inodes (ext4)',
      layer: 'Hardware Storage & File System',
      summary: 'Stores files permanently on NAND flash memory blocks. VFS maps filenames to Inode numbers.',
      details: 'Directory entries store filenames and inode pointers. Inodes store permissions (rwxr-xr-x), file size, and physical sector locations.'
    });

    // 2. Secondary Storage Magnetic Disk Platter
    const diskGroup = new THREE.Group();
    diskGroup.position.set(5.5, 0, 1.5);

    const metalPlatter = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 2.8, 0.35, 32),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.95,
        roughness: 0.1,
        emissive: 0x00ff88,
        emissiveIntensity: 0.15
      })
    );
    metalPlatter.position.y = 1.0;
    diskGroup.add(metalPlatter);

    this.group.add(diskGroup);
  }

  highlightNode(nodeId, active = true, colorHex = 0x00ff88) {
    const node = this.nodes[nodeId];
    if (!node) return;

    if (active) {
      node.scale.set(1.1, 1.1, 1.1);
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
