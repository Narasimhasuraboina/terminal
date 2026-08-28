import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { SceneManager } from './core/sceneManager.js';
import { CameraManager } from './core/cameraManager.js';
import { ParticleSystem } from './core/particleSystem.js';
import { LayerUserSpace } from './world/layerUserSpace.js';
import { LayerSyscall } from './world/layerSyscall.js';
import { LayerKernel } from './world/layerKernel.js';
import { LayerVFS } from './world/layerVFS.js';
import { DataHighways } from './world/dataHighways.js';
import { WaypointBeacon } from './world/waypointBeacon.js';
import { CommandEngine } from './simulation/commandEngine.js';
import { TimelineRunner } from './simulation/timelineRunner.js';
import { TerminalUI } from './ui/terminalUI.js';
import { HudOverlay } from './ui/hudOverlay.js';
import { InspectorModal } from './ui/inspectorModal.js';
import { GuideModal } from './ui/guideModal.js';
import { BlueprintOverlay } from './ui/blueprintOverlay.js';
import { QuizMode } from './ui/quizMode.js';
import { MissionsModal } from './ui/missionsModal.js';
import { sound } from './audio/soundFX.js';

class App {
  constructor() {
    this.initCore();
    this.initWorld();
    this.initSimulation();
    this.initUI();
    this.startAnimationLoop();

    // Auto-load initial default command simulation (ls -la)
    const initialPlan = this.commandEngine.getCommandPlan('ls -la');
    if (initialPlan) {
      this.hudOverlay.updatePlan(initialPlan);
      this.timelineRunner.loadPlan(initialPlan);
      setTimeout(() => {
        if (!this.timelineRunner.isPlaying) {
          this.timelineRunner.play();
        }
      }, 1000);
    }
  }

  initCore() {
    const viewport = document.getElementById('app-viewport');
    this.sceneManager = new SceneManager(viewport);
    this.cameraManager = new CameraManager(this.sceneManager.camera, viewport);
    this.particleSystem = new ParticleSystem(this.sceneManager.scene);
  }

  initWorld() {
    this.layerUserSpace = new LayerUserSpace(this.sceneManager);
    this.layerSyscall = new LayerSyscall(this.sceneManager);
    this.layerKernel = new LayerKernel(this.sceneManager);
    this.layerVFS = new LayerVFS(this.sceneManager);
    this.dataHighways = new DataHighways(this.sceneManager.scene);
    this.waypointBeacon = new WaypointBeacon(this.sceneManager.scene);

    this.layers = {
      userspace: this.layerUserSpace,
      syscall: this.layerSyscall,
      kernel: this.layerKernel,
      vfs: this.layerVFS
    };

    // On 3D Node Click -> Open Inspector Modal
    this.sceneManager.onNodeClick = (meta) => {
      this.inspectorModal.show(meta);
      sound.playKeyClick();
    };
  }

  initSimulation() {
    this.commandEngine = new CommandEngine();

    this.timelineRunner = new TimelineRunner({
      sceneManager: this.sceneManager,
      cameraManager: this.cameraManager,
      particleSystem: this.particleSystem,
      dataHighways: this.dataHighways,
      layers: this.layers,
      waypointBeacon: this.waypointBeacon
    });
  }

  initUI() {
    const terminalContainer = document.getElementById('terminal-dock');
    const hudContainer = document.getElementById('hud-container');
    const modalContainer = document.getElementById('modal-container');
    const guideContainer = document.getElementById('guide-container');
    const blueprintContainer = document.getElementById('blueprint-container');
    const quizContainer = document.getElementById('quiz-container');

    this.inspectorModal = new InspectorModal(modalContainer);
    this.guideModal = new GuideModal(guideContainer);
    this.blueprintOverlay = new BlueprintOverlay(blueprintContainer, this.timelineRunner);
    this.quizMode = new QuizMode(quizContainer);

    this.terminalUI = new TerminalUI(terminalContainer, (cmd) => {
      this.executeCommand(cmd);
    });

    this.hudOverlay = new HudOverlay({
      domElement: hudContainer,
      runner: this.timelineRunner,
      cameraManager: this.cameraManager,
      sound: sound,
      onOpenInspector: (stage) => this.inspectorModal.show(stage),
      onOpenGuide: () => this.guideModal.show(),
      onToggleBlueprint: () => this.blueprintOverlay.toggle(),
      onOpenQuiz: () => this.quizMode.show(),
      onOpenMissions: () => this.missionsModal.toggle()
    });

    this.missionsModal = new MissionsModal({
      timelineRunner: this.timelineRunner,
      commandEngine: this.commandEngine,
      hudOverlay: this.hudOverlay,
      terminalUI: this.terminalUI
    });

    // Wire Runner Callbacks to UI
    this.timelineRunner.onStageChange = (stage, index, total) => {
      this.hudOverlay.updateStage(stage, index, total);
      this.blueprintOverlay.updateStage(stage, index, total);
      if (stage.terminalOutput) {
        this.terminalUI.appendOutput(stage.terminalOutput);
      }
    };

    this.timelineRunner.onPlayStateChange = (isPlaying) => {
      this.hudOverlay.updatePlayState(isPlaying);
    };
  }

  executeCommand(cmdText) {
    const plan = this.commandEngine.getCommandPlan(cmdText);
    if (!plan) return;

    this.terminalUI.appendOutput(`$ ${cmdText}`, true);
    this.hudOverlay.updatePlan(plan);
    this.timelineRunner.loadPlan(plan);
    this.timelineRunner.play();
  }

  startAnimationLoop() {
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Update TWEEN animations
      TWEEN.update();

      // Update 3D systems
      this.sceneManager.update(delta);
      this.layerUserSpace.update(delta);
      this.layerSyscall.update(delta);
      this.layerKernel.update(delta);
      this.layerVFS.update(delta);
      this.particleSystem.update(delta);
      if (this.waypointBeacon) {
        this.waypointBeacon.update(delta);
      }

      // Render 3D frame
      this.sceneManager.render();
    };

    animate();
  }
}

// Launch application on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
