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
    // World coordinates of our 3D components (Calibrated to hardware level)
    this.points = {
      terminal: new THREE.Vector3(-38.5, 1.5, 12),
      lexer: new THREE.Vector3(-31, 1.5, 8),
      path: new THREE.Vector3(-31, 1.5, 12),

      fork: new THREE.Vector3(-14, 2.0, 4.5),
      syscall: new THREE.Vector3(-10, 3.5, 0),
      execve: new THREE.Vector3(-5, 2.0, 4.5),
      fd_table: new THREE.Vector3(-10, 2.0, -4),

      cpu: new THREE.Vector3(10.5, 2.5, 1.5),
      mmu: new THREE.Vector3(21.5, 2.5, 1.5),
      scheduler: new THREE.Vector3(10.5, 2.5, -3),

      vfs: new THREE.Vector3(36, 2.0, 11.5),
      page_cache: new THREE.Vector3(40, 2.0, 7),
      disk: new THREE.Vector3(45.5, 2.0, 11.5)
    };
  }

  buildHighways() {
    // Define clean, non-obstructing data conduit routes
    const routes = [
      // User Space internal (Runs neatly along desk)
      { from: 'terminal', to: 'lexer', color: 0x00f3ff, midOffset: new THREE.Vector3(0, 0.8, 0) },
      { from: 'lexer', to: 'path', color: 0x00f3ff, midOffset: new THREE.Vector3(0, 0.8, 0) },

      // Shell -> Syscall boundary
      { from: 'path', to: 'fork', color: 0xff0077, midOffset: new THREE.Vector3(-4, 1.5, -2) },
      { from: 'fork', to: 'syscall', color: 0xff0077, midOffset: new THREE.Vector3(0, 1.2, 0) },
      { from: 'syscall', to: 'execve', color: 0xff0077, midOffset: new THREE.Vector3(0, 1.2, 0) },

      // Syscall -> Kernel Core / Memory
      { from: 'execve', to: 'mmu', color: 0x2979ff, midOffset: new THREE.Vector3(6, 2.5, -2) },
      { from: 'syscall', to: 'cpu', color: 0x2979ff, midOffset: new THREE.Vector3(0, 2.0, 0) },
      { from: 'mmu', to: 'cpu', color: 0x2979ff, midOffset: new THREE.Vector3(0, 1.2, 0) },
      { from: 'cpu', to: 'scheduler', color: 0xffaa00, midOffset: new THREE.Vector3(0, 1.0, 0) },

      // Kernel -> VFS Storage
      { from: 'cpu', to: 'vfs', color: 0x00ff88, midOffset: new THREE.Vector3(12, 2.5, 4) },
      { from: 'vfs', to: 'page_cache', color: 0x00ff88, midOffset: new THREE.Vector3(0, 1.0, 0) },
      { from: 'page_cache', to: 'disk', color: 0x00ff88, midOffset: new THREE.Vector3(0, 1.0, 0) },

      // Return Stream: Disk/VFS -> CPU -> File Descriptors -> Terminal (Routes around back)
      { from: 'disk', to: 'cpu', color: 0x00f3ff, midOffset: new THREE.Vector3(18, 3.5, -3) },
      { from: 'cpu', to: 'fd_table', color: 0x00f3ff, midOffset: new THREE.Vector3(0, 2.0, -3) },
      { from: 'fd_table', to: 'terminal', color: 0x00f3ff, midOffset: new THREE.Vector3(-18, 2.0, -3) }
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
