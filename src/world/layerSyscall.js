import * as THREE from 'three';

export class LayerSyscall {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.scene;
    this.group = new THREE.Group();
    this.group.position.set(-10, 0, 0);
    this.scene.add(this.group);

    this.nodes = {};
    this.buildPlatform();
    this.buildGateModel();
  }

  buildPlatform() {
    const baseGeo = new THREE.BoxGeometry(22, 0.6, 20);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x120a1f,
      metalness: 0.9,
      roughness: 0.3
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.3;
    this.group.add(baseMesh);

    const edgeGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xff0077, transparent: true, opacity: 0.6 });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    edgeLines.position.y = -0.3;
    this.group.add(edgeLines);
  }

  buildGateModel() {
    // 1. Cyber Security Arch (User Space ➔ Kernel Space Gate)
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, 0);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x160c26,
      metalness: 0.9,
      roughness: 0.25
    });

    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.0, 1.4), pillarMat);
    leftPillar.position.set(-4.5, 3.0, 0);
    archGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 6.0, 1.4), pillarMat);
    rightPillar.position.set(4.5, 3.0, 0);
    archGroup.add(rightPillar);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(10.4, 1.2, 1.6), pillarMat);
    topBeam.position.set(0, 6.0, 0);
    archGroup.add(topBeam);

    // Glowing Laser Forcefield Curtain
    const shieldGeo = new THREE.PlaneGeometry(7.6, 5.4);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, 3.0, 0);
    archGroup.add(this.shieldMesh);

    // Gate Under-glow
    const gateHaloGeo = new THREE.RingGeometry(3.0, 3.5, 32);
    const gateHaloMat = new THREE.MeshBasicMaterial({
      color: 0xff0077,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    this.gateHalo = new THREE.Mesh(gateHaloGeo, gateHaloMat);
    this.gateHalo.rotation.x = -Math.PI / 2;
    this.gateHalo.position.set(0, 0.05, 0);
    archGroup.add(this.gateHalo);

    this.group.add(archGroup);
    this.nodes['syscall_dispatcher'] = topBeam;

    this.sceneManager.registerInteractiveObject(topBeam, {
      id: 'syscall_dispatcher',
      title: '🛡️ Syscall Gateway (CPU Privilege Switch)',
      layer: 'Hardware Privilege Boundary',
      summary: 'Switches CPU from User Mode (Ring 3) to Kernel Mode (Ring 0).',
      details: 'User programs cannot touch hardware directly. The `syscall` instruction safely hands control to the Linux kernel.'
    });

    // 2. Process Cloning Chamber (fork station)
    const forkGroup = new THREE.Group();
    forkGroup.position.set(-4.0, 0, 4.5);

    const forkPod = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.6, 2.6, 16),
      new THREE.MeshStandardMaterial({
        color: 0x1f0e2f,
        metalness: 0.85,
        roughness: 0.25
      })
    );
    forkPod.position.y = 1.3;
    forkGroup.add(forkPod);

    const forkHalo = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 2.0, 32),
      new THREE.MeshBasicMaterial({ color: 0xff9500, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    forkHalo.rotation.x = -Math.PI / 2;
    forkHalo.position.y = 0.05;
    forkGroup.add(forkHalo);
    this.forkHalo = forkHalo;

    this.group.add(forkGroup);
    this.nodes['fork'] = forkGroup;

    this.sceneManager.registerInteractiveObject(forkPod, {
      id: 'fork',
      title: '👥 fork() Process Cloner',
      layer: 'Kernel Process Management',
      summary: 'Clones the parent shell into an identical child worker process with a new PID.',
      details: 'Prevents the shell from being terminated when the command finishes.'
    });

    // 3. Execve Transformation Chamber
    const execGroup = new THREE.Group();
    execGroup.position.set(4.0, 0, 4.5);

    const execPod = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.6, 2.6, 16),
      new THREE.MeshStandardMaterial({
        color: 0x1f0e2f,
        metalness: 0.85,
        roughness: 0.25
      })
    );
    execPod.position.y = 1.3;
    execGroup.add(execPod);

    const execHalo = new THREE.Mesh(
      new THREE.RingGeometry(1.6, 2.0, 32),
      new THREE.MeshBasicMaterial({ color: 0x30d158, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    execHalo.rotation.x = -Math.PI / 2;
    execHalo.position.y = 0.05;
    execGroup.add(execHalo);
    this.execHalo = execHalo;

    this.group.add(execGroup);
    this.nodes['execve'] = execGroup;
    this.nodes['fd_table'] = topBeam;

    this.sceneManager.registerInteractiveObject(execPod, {
      id: 'execve',
      title: '⚡ execve() Program Reloader',
      layer: 'Kernel Exec Subsystem',
      summary: 'Replaces the child process memory with the compiled program from disk.',
      details: 'Clears old memory and loads the new ELF binary (e.g. /usr/bin/ls).'
    });
  }

  highlightNode(nodeId, active = true, colorHex = 0xff0055) {
    if (nodeId === 'syscall_dispatcher' && this.gateHalo) {
      this.gateHalo.material.color.setHex(colorHex);
      this.gateHalo.material.opacity = active ? 0.9 : 0;
    } else if (nodeId === 'fork' && this.forkHalo) {
      this.forkHalo.material.color.setHex(colorHex);
      this.forkHalo.material.opacity = active ? 0.9 : 0;
    } else if (nodeId === 'execve' && this.execHalo) {
      this.execHalo.material.color.setHex(colorHex);
      this.execHalo.material.opacity = active ? 0.9 : 0;
    }
  }

  pulseRingShield() {
    if (this.shieldMesh) {
      this.shieldMesh.scale.set(1.08, 1.08, 1.08);
      setTimeout(() => {
        if (this.shieldMesh) this.shieldMesh.scale.set(1, 1, 1);
      }, 300);
    }
  }

  update(delta) {}
}
