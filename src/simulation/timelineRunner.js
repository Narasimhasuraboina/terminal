import * as THREE from 'three';
import { sound } from '../audio/soundFX.js';

export class TimelineRunner {
  constructor({ sceneManager, cameraManager, particleSystem, dataHighways, layers, waypointBeacon }) {
    this.sceneManager = sceneManager;
    this.cameraManager = cameraManager;
    this.particleSystem = particleSystem;
    this.dataHighways = dataHighways;
    this.layers = layers;
    this.waypointBeacon = waypointBeacon;

    this.currentPlan = null;
    this.currentStageIndex = 0;
    this.isPlaying = false;
    this.speedMultiplier = 1.0;
    this.autoCamera = true;
    this.timer = null;

    this.onStageChange = null;
    this.onPlayStateChange = null;

    // 3D Physical coordinates for pinpoints
    this.nodePositions = {
      terminal: new THREE.Vector3(-41, 0, 10),
      lexer: new THREE.Vector3(-32, 0, 10),
      path: new THREE.Vector3(-32, 0, 10),
      fork: new THREE.Vector3(-15, 0, 6),
      syscall_dispatcher: new THREE.Vector3(-10, 0, 0),
      execve: new THREE.Vector3(-5, 0, 6),
      fd_table: new THREE.Vector3(-10, 0, 0),
      cpu_core: new THREE.Vector3(10, 0, -2),
      mmu_memory: new THREE.Vector3(22, 0, -2),
      scheduler: new THREE.Vector3(10, 0, -2),
      vfs_tree: new THREE.Vector3(38, 0, 12),
      page_cache: new THREE.Vector3(38, 0, 12),
      storage_disk: new THREE.Vector3(46, 0, 12),
      disk: new THREE.Vector3(46, 0, 12)
    };
  }

  loadPlan(plan) {
    this.stop();
    this.currentPlan = plan;
    this.currentStageIndex = 0;
    this.particleSystem.clear();
    this.resetAllHighlights();
    this.executeCurrentStage();
  }

  setSpeed(speed) {
    this.speedMultiplier = speed;
  }

  toggleAutoCamera() {
    this.autoCamera = !this.autoCamera;
    return this.autoCamera;
  }

  play() {
    if (!this.currentPlan) return;
    this.isPlaying = true;
    if (this.onPlayStateChange) this.onPlayStateChange(true);
    this.scheduleNextStep();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  stop() {
    this.pause();
    this.currentStageIndex = 0;
    this.resetAllHighlights();
  }

  stepForward() {
    if (!this.currentPlan) return;
    this.pause();
    if (this.currentStageIndex < this.currentPlan.stages.length - 1) {
      this.currentStageIndex++;
      this.executeCurrentStage();
    }
  }

  stepBackward() {
    if (!this.currentPlan) return;
    this.pause();
    if (this.currentStageIndex > 0) {
      this.currentStageIndex--;
      this.executeCurrentStage();
    }
  }

  jumpToStage(index) {
    if (!this.currentPlan || index < 0 || index >= this.currentPlan.stages.length) return;
    this.pause();
    this.currentStageIndex = index;
    this.executeCurrentStage();
  }

  scheduleNextStep() {
    if (!this.isPlaying || !this.currentPlan) return;

    if (this.currentStageIndex >= this.currentPlan.stages.length - 1) {
      this.pause();
      return;
    }

    const currentStage = this.currentPlan.stages[this.currentStageIndex];
    const nextStage = this.currentPlan.stages[this.currentStageIndex + 1];

    const rawDelay = Math.max(1000, nextStage.timeOffset - currentStage.timeOffset);
    const delay = rawDelay / this.speedMultiplier;

    this.timer = setTimeout(() => {
      if (!this.isPlaying) return;
      this.currentStageIndex++;
      this.executeCurrentStage();
      this.scheduleNextStep();
    }, delay);
  }

  executeCurrentStage() {
    if (!this.currentPlan) return;
    const stage = this.currentPlan.stages[this.currentStageIndex];
    if (!stage) return;

    this.resetAllHighlights();

    // 1. Highlight Active 3D Node & Layer
    const isErrorStage = stage.sound === 'error' || this.currentPlan.isError;
    const highlightColor = isErrorStage ? 0xff0055 : null;
    this.highlightStageNode(stage, highlightColor);

    // 2. Move 3D Waypoint Beacon Pin
    if (this.waypointBeacon && stage.activeNode) {
      const targetPos = this.nodePositions[stage.activeNode] || new THREE.Vector3(0, 0, 0);
      this.waypointBeacon.moveTo(targetPos, 600);
      this.waypointBeacon.updateLabel(stage.simpleTitle || stage.name, isErrorStage);
    }

    // 3. Update 3D Live Desktop Monitor Screen in-world
    if (this.layers.userspace && this.layers.userspace.updateMonitorScreen) {
      const outputList = stage.terminalOutput ? stage.terminalOutput.split('\n') : [`Step ${this.currentStageIndex + 1}: ${stage.name}`];
      this.layers.userspace.updateMonitorScreen(this.currentPlan.name, outputList, stage.simpleTitle || stage.name);
    }

    // 4. Play Stage Sound
    if (stage.sound) {
      switch (stage.sound) {
        case 'key': sound.playKeyClick(); break;
        case 'syscall': sound.playSyscall(); break;
        case 'fork': sound.playFork(); break;
        case 'kernel': sound.playKernelPulse(); break;
        case 'disk': sound.playDiskIO(); break;
        case 'success': sound.playSuccess(); break;
        case 'error': sound.playError(); break;
      }
    }

    // 5. Cinematic Zoom to Active Node
    if (this.autoCamera) {
      if (stage.activeNode && this.cameraManager.zoomToNode) {
        this.cameraManager.zoomToNode(stage.activeNode, 900);
      } else if (stage.cameraTarget) {
        this.cameraManager.transitionTo(stage.cameraTarget, 900);
      }
    }

    // 6. Send 3D Photon Data Packet along Spline
    if (stage.route) {
      const curve = this.dataHighways.getCurve(stage.route.from, stage.route.to);
      if (curve) {
        const duration = 0.8 / this.speedMultiplier;
        this.particleSystem.sendPacket(curve, duration, stage.route.color);
      }
    }

    // 7. Special Layer effects
    if (stage.ring === 0 && this.layers.syscall) {
      this.layers.syscall.pulseRingShield();
    }

    // 8. Callback for HUD / UI update
    if (this.onStageChange) {
      this.onStageChange(stage, this.currentStageIndex, this.currentPlan.stages.length);
    }
  }

  resetAllHighlights() {
    if (this.layers.userspace) {
      ['terminal', 'lexer', 'path'].forEach(id => this.layers.userspace.highlightNode(id, false));
    }
    if (this.layers.syscall) {
      ['syscall_dispatcher', 'fork', 'execve', 'fd_table'].forEach(id => this.layers.syscall.highlightNode(id, false));
    }
    if (this.layers.kernel) {
      ['cpu_core', 'mmu_memory', 'scheduler'].forEach(id => this.layers.kernel.highlightNode(id, false));
    }
    if (this.layers.vfs) {
      ['vfs_tree', 'page_cache', 'storage_disk'].forEach(id => this.layers.vfs.highlightNode(id, false));
    }
  }

  highlightStageNode(stage, customColor = null) {
    const node = stage.activeNode;
    if (!node) return;

    if (['terminal', 'lexer', 'path'].includes(node) && this.layers.userspace) {
      this.layers.userspace.highlightNode(node, true, customColor || 0x00f3ff);
    } else if (['syscall_dispatcher', 'fork', 'execve', 'fd_table'].includes(node) && this.layers.syscall) {
      this.layers.syscall.highlightNode(node, true, customColor || 0xff0077);
    } else if (['cpu_core', 'mmu_memory', 'scheduler'].includes(node) && this.layers.kernel) {
      this.layers.kernel.highlightNode(node, true, customColor || 0x2979ff);
    } else if (['vfs_tree', 'page_cache', 'storage_disk', 'disk'].includes(node) && this.layers.vfs) {
      const vfsKey = node === 'disk' ? 'storage_disk' : node;
      this.layers.vfs.highlightNode(vfsKey, true, customColor || 0x00ff88);
    }
  }
}
