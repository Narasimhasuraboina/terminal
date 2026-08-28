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
    const baseGeo = new THREE.BoxGeometry(22, 0.6, 20);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x041310,
      metalness: 0.9,
      roughness: 0.3
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.3;
    this.group.add(baseMesh);

    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.6 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.3;
    this.group.add(edgeLines);
  }

  buildHardwareModels() {
    // 1. Realistic M.2 2280 NVMe SSD Stick
    const ssdGroup = new THREE.Group();
    ssdGroup.position.set(-4.0, 0, 1.5);

    const ssdPcb = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.22, 7.2),
      new THREE.MeshStandardMaterial({ color: 0x060f17, roughness: 0.3, metalness: 0.4 })
    );
    ssdPcb.position.y = 0.12;
    ssdGroup.add(ssdPcb);

    const goldPins = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.25, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.1 })
    );
    goldPins.position.set(0, 0.12, 3.4);
    ssdGroup.add(goldPins);

    const controller = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.38, 2.0),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.15
      })
    );
    controller.position.set(0, 0.32, -1.8);
    ssdGroup.add(controller);

    for (let i = 0; i < 2; i++) {
      const nand = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.35, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x050810, roughness: 0.2, metalness: 0.5 })
      );
      nand.position.set(0, 0.32, 0.5 + i * 2.0);
      ssdGroup.add(nand);
    }

    // SSD Underglow Ring
    const ssdHalo = new THREE.Mesh(
      new THREE.RingGeometry(2.6, 3.2, 32),
      new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    ssdHalo.rotation.x = -Math.PI / 2;
    ssdHalo.position.set(0, 0.05, 0);
    ssdGroup.add(ssdHalo);
    this.ssdHalo = ssdHalo;

    this.group.add(ssdGroup);
    this.nodes['vfs_tree'] = ssdGroup;
    this.nodes['page_cache'] = ssdGroup;
    this.nodes['storage_disk'] = ssdGroup;

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
      new THREE.CylinderGeometry(2.6, 2.6, 0.3, 32),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.95,
        roughness: 0.1
      })
    );
    metalPlatter.position.y = 0.8;
    diskGroup.add(metalPlatter);

    this.group.add(diskGroup);
  }

  highlightNode(nodeId, active = true, colorHex = 0x00ff88) {
    if (this.ssdHalo) {
      this.ssdHalo.material.color.setHex(colorHex);
      this.ssdHalo.material.opacity = active ? 0.9 : 0;
    }
  }

  update(delta) {}
}
