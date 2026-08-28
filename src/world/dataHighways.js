import * as THREE from 'three';

export class DataHighways {
  constructor(scene) {
    this.scene = scene;
    this.curves = {};
    this.highwayGroup = new THREE.Group();
    this.scene.add(this.highwayGroup);

    this.initNamedPoints();
    this.buildHighways();
  }

  initNamedPoints() {
    // World coordinates of our 3D components
    this.points = {
      terminal: new THREE.Vector3(-42, 4, 13),
      lexer: new THREE.Vector3(-36, 4, 6),
      path: new THREE.Vector3(-30, 4, 13),

      fork: new THREE.Vector3(-15, 3.5, 6),
      syscall: new THREE.Vector3(-10, 5, 0),
      execve: new THREE.Vector3(-5, 3.5, 6),
      fd_table: new THREE.Vector3(-10, 3, -6),

      cpu: new THREE.Vector3(10, 4.5, -1),
      mmu: new THREE.Vector3(21.5, 4.5, -1),
      scheduler: new THREE.Vector3(16, 4.5, -9),

      vfs: new THREE.Vector3(36, 3.5, 12),
      page_cache: new THREE.Vector3(42, 3.5, 6),
      disk: new THREE.Vector3(48, 3.5, 12)
    };
  }

  buildHighways() {
    // Define the primary data conduit routes
    const routes = [
      // User Space internal
      { from: 'terminal', to: 'lexer', color: 0x00f3ff, midOffset: new THREE.Vector3(0, 2, 0) },
      { from: 'lexer', to: 'path', color: 0x00f3ff, midOffset: new THREE.Vector3(0, 2, 0) },

      // Shell -> Syscall boundary
      { from: 'path', to: 'fork', color: 0xff0077, midOffset: new THREE.Vector3(-5, 4, -2) },
      { from: 'fork', to: 'syscall', color: 0xff0077, midOffset: new THREE.Vector3(0, 2, 0) },
      { from: 'syscall', to: 'execve', color: 0xff0077, midOffset: new THREE.Vector3(0, 2, 0) },

      // Syscall -> Kernel Core / Memory
      { from: 'execve', to: 'mmu', color: 0x2979ff, midOffset: new THREE.Vector3(8, 6, -3) },
      { from: 'syscall', to: 'cpu', color: 0x2979ff, midOffset: new THREE.Vector3(0, 4, 0) },
      { from: 'mmu', to: 'cpu', color: 0x2979ff, midOffset: new THREE.Vector3(0, 2, 0) },
      { from: 'cpu', to: 'scheduler', color: 0xffaa00, midOffset: new THREE.Vector3(0, 2, 0) },

      // Kernel -> VFS Storage
      { from: 'cpu', to: 'vfs', color: 0x00ff88, midOffset: new THREE.Vector3(15, 6, 8) },
      { from: 'vfs', to: 'page_cache', color: 0x00ff88, midOffset: new THREE.Vector3(0, 2, 0) },
      { from: 'page_cache', to: 'disk', color: 0x00ff88, midOffset: new THREE.Vector3(0, 2, 0) },

      // Return Stream: Disk/VFS -> CPU -> File Descriptors -> Terminal
      { from: 'disk', to: 'cpu', color: 0x00f3ff, midOffset: new THREE.Vector3(25, 8, -5) },
      { from: 'cpu', to: 'fd_table', color: 0x00f3ff, midOffset: new THREE.Vector3(0, 4, -5) },
      { from: 'fd_table', to: 'terminal', color: 0x00f3ff, midOffset: new THREE.Vector3(-25, 6, 0) }
    ];

    routes.forEach(r => {
      const p1 = this.points[r.from];
      const p2 = this.points[r.to];
      if (!p1 || !p2) return;

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5).add(r.midOffset);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);

      const key = `${r.from}->${r.to}`;
      this.curves[key] = curve;

      // 3D Tube Mesh for the neon highway
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.12, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: r.color,
        transparent: true,
        opacity: 0.35,
        wireframe: false
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      this.highwayGroup.add(tubeMesh);
    });
  }

  getCurve(fromKey, toKey) {
    const directKey = `${fromKey}->${toKey}`;
    if (this.curves[directKey]) return this.curves[directKey];

    // Fallback: create dynamic curve
    const p1 = this.points[fromKey] || new THREE.Vector3(0, 0, 0);
    const p2 = this.points[toKey] || new THREE.Vector3(0, 0, 0);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5).add(new THREE.Vector3(0, 4, 0));
    return new THREE.QuadraticBezierCurve3(p1, mid, p2);
  }
}
