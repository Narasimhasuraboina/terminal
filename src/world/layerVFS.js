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
    // ==========================================
    // 1. PHOTOREALISTIC M.2 2280 NVMe SSD DRIVE
    // ==========================================
    const ssdGroup = new THREE.Group();
    ssdGroup.position.set(-4.0, 0, 1.5);

    // M.2 Standoff Base & Motherboard Slot
    const slotMesh = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.45, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.7 })
    );
    slotMesh.position.set(0, 0.22, 3.8);
    ssdGroup.add(slotMesh);

    // Standoff Screw on Rear
    const standoff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.5, 16),
      new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.95, roughness: 0.1 })
    );
    standoff.position.set(0, 0.25, -3.6);
    ssdGroup.add(standoff);

    // M.2 2280 PCB (Matte Black with Gold Traces)
    const ssdPcb = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.22, 7.6),
      new THREE.MeshStandardMaterial({ color: 0x040812, roughness: 0.35, metalness: 0.5 })
    );
    ssdPcb.position.y = 0.42;
    ssdGroup.add(ssdPcb);

    // Gold M-Key Edge Connector Pins (75 Pin Gold Fingers)
    const goldPins = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.24, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 })
    );
    goldPins.position.set(0, 0.42, 3.6);
    ssdGroup.add(goldPins);

    // High-Speed PCIe 4.0 NVMe Controller Chip (Metallic Silicon)
    const controller = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.35, 2.0),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.92,
        roughness: 0.15
      })
    );
    controller.position.set(0, 0.62, -1.6);
    ssdGroup.add(controller);

    // 3D TLC Flash NAND Storage Packages
    for (let i = 0; i < 2; i++) {
      const nand = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.32, 1.9),
        new THREE.MeshStandardMaterial({ color: 0x070b14, roughness: 0.25, metalness: 0.4 })
      );
      nand.position.set(0, 0.60, 0.7 + i * 2.1);
      ssdGroup.add(nand);
    }

    // Realistic Laser-Printed SSD Label Texture
    const ssdCanvas = document.createElement('canvas');
    ssdCanvas.width = 256;
    ssdCanvas.height = 512;
    const sCtx = ssdCanvas.getContext('2d');
    
    sCtx.fillStyle = '#080e1a';
    sCtx.fillRect(0, 0, 256, 512);

    // Gold & Cyan accents
    sCtx.strokeStyle = '#00ff88';
    sCtx.lineWidth = 3;
    sCtx.strokeRect(6, 6, 244, 500);

    sCtx.fillStyle = '#00ff88';
    sCtx.font = 'bold 20px "Fira Code", monospace';
    sCtx.textAlign = 'center';
    sCtx.fillText('NVMe PCIe 4.0 SSD', 128, 48);

    sCtx.fillStyle = '#94a3b8';
    sCtx.font = '13px monospace';
    sCtx.fillText('VFS Inodes & NAND Storage', 128, 80);
    sCtx.fillText('Read: 7,450 MB/s • ext4 FS', 128, 105);

    // Controller details
    sCtx.fillStyle = '#38bdf8';
    sCtx.font = 'bold 12px monospace';
    sCtx.fillText('[CONTROLLER: 8-CHANNEL DMA]', 128, 220);

    // Flash blocks
    sCtx.fillStyle = '#e2e8f0';
    sCtx.fillText('3D TLC FLASH NAND #1', 128, 360);
    sCtx.fillText('3D TLC FLASH NAND #2', 128, 460);

    const ssdTex = new THREE.CanvasTexture(ssdCanvas);
    const ssdLabelPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 7.2),
      new THREE.MeshStandardMaterial({ map: ssdTex, roughness: 0.3, metalness: 0.6 })
    );
    ssdLabelPlane.rotation.x = -Math.PI / 2;
    ssdLabelPlane.position.y = 0.77;
    ssdGroup.add(ssdLabelPlane);

    // SSD Underglow Ring
    const ssdHalo = new THREE.Mesh(
      new THREE.RingGeometry(2.8, 3.4, 32),
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
      title: '💾 M.2 NVMe SSD & VFS Storage Subsystem',
      layer: 'Hardware Storage & ext4 Inode Tables',
      summary: 'High-speed solid-state flash memory storing permanent files and POSIX directory Inodes.',
      details: 'Directory entries store filenames and inode pointers. Inodes store permissions (rwxr-xr-x), file size, and physical sector locations.'
    });

    // ==========================================
    // 2. PRECISION METALLIC DISK PLATTER & ACTUATOR ARM
    // ==========================================
    const diskGroup = new THREE.Group();
    diskGroup.position.set(5.5, 0, 1.5);

    // Base Drive Enclosure Tray (Brushed Magnesium)
    const tray = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.4, 8.4),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.3 })
    );
    tray.position.y = 0.2;
    diskGroup.add(tray);

    // Mirror Finish Platter (Polished Aluminum)
    const platterMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.98,
      roughness: 0.08
    });
    const metalPlatter = new THREE.Mesh(
      new THREE.CylinderGeometry(2.8, 2.8, 0.2, 48),
      platterMat
    );
    metalPlatter.position.set(0, 0.5, 0.8);
    diskGroup.add(metalPlatter);

    // Spindle Hub Center
    const spindle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 })
    );
    spindle.position.set(0, 0.58, 0.8);
    diskGroup.add(spindle);

    // Actuator Read/Write Head Arm
    const armMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 });
    const armPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 24), armMat);
    armPivot.position.set(-1.8, 0.6, -2.4);
    diskGroup.add(armPivot);

    const armBar = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 3.2), armMat);
    armBar.position.set(-0.8, 0.65, -0.8);
    armBar.rotation.y = 0.45;
    diskGroup.add(armBar);

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
