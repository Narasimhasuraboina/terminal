import * as THREE from 'three';

export class LayerVFS {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.group = new THREE.Group();
    this.group.position.set(42, 0, 10);
    this.scene.add(this.group);

    this.nodes = {};
    this.buildPlatform();
    this.buildHardwareModels();
  }

  buildPlatform() {
    const baseGeo = new THREE.BoxGeometry(22, 1.2, 20);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x061a15,
      metalness: 0.8,
      roughness: 0.25,
      emissive: 0x008855,
      emissiveIntensity: 0.2
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.6;
    this.group.add(baseMesh);

    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ff88, linewidth: 2 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.6;
    this.group.add(edgeLines);

    this.createHoloLabel('💾 STEP 4: NVMe SSD & FILE SYSTEM', new THREE.Vector3(0, 13, -8), 0x00ff88, '#00ff88');
  }

  createHoloLabel(text, pos, colorHex, borderHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 130;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(4, 24, 16, 0.92)';
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
    // 1. Realistic M.2 NVMe SSD Card
    const ssdGroup = new THREE.Group();
    ssdGroup.position.set(-4, 0, 2);

    // Dark Green/Black M.2 PCB Stick
    const ssdPcb = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    ssdPcb.position.y = 0.2;
    ssdGroup.add(ssdPcb);

    // Controller Chip
    const controller = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.5, 2.5),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0x00ff88,
        emissiveIntensity: 0.3,
        metalness: 0.9
      })
    );
    controller.position.set(0, 0.6, -2);
    ssdGroup.add(controller);

    // NAND Flash Memory Chips (2 blocks)
    for (let i = 0; i < 2; i++) {
      const nand = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.5, 2),
        new THREE.MeshStandardMaterial({ color: 0x070b14, roughness: 0.2 })
      );
      nand.position.set(0, 0.6, 1 + i * 2.4);
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

    // 2. Secondary Hard Drive Platter (Magnetic Disk)
    const diskGroup = new THREE.Group();
    diskGroup.position.set(6, 0, 2);

    const metalPlatter = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.2, 0.4, 32),
      new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.95,
        roughness: 0.1,
        emissive: 0x00ff88,
        emissiveIntensity: 0.15
      })
    );
    metalPlatter.position.y = 1.5;
    diskGroup.add(metalPlatter);

    this.group.add(diskGroup);
  }

  highlightNode(nodeId, active = true, colorHex = 0x00ff88) {
    const node = this.nodes[nodeId];
    if (!node) return;

    if (active) {
      node.scale.set(1.2, 1.2, 1.2);
      if (node.material && node.material.emissive) {
        node.material.emissive.setHex(colorHex);
        node.material.emissiveIntensity = 0.95;
      }
    } else {
      node.scale.set(1, 1, 1);
      if (node.material && node.material.emissive) {
        node.material.emissiveIntensity = 0.3;
      }
    }
  }

  update(delta) {}
}
