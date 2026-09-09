/**
 * @fileoverview Main Application Entry Point - Bootstraps Three.js scene, UI overlays,
 * audio synthesizers, terminal event listeners, and animation loop.
 * @module main
 */

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
import { PracticePage } from './ui/practicePage.js';
import { LINUX_100_COMMANDS } from './data/linux100Commands.js';
import { VirtualLinuxEnv } from './simulation/virtualLinuxEnv.js';
import { sound } from './audio/soundFX.js';

class App {
  constructor() {
    this.is3DActive = true;
    this.initCore();
    this.initWorld();
    this.initSimulation();
    this.initUI();
    this.setupGlobalKeyboardShortcuts();
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
    this.vEnv = new VirtualLinuxEnv();
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
    const practiceContainer = document.getElementById('practice-container');

    this.inspectorModal = new InspectorModal(modalContainer);
    this.guideModal = new GuideModal(guideContainer);
    this.blueprintOverlay = new BlueprintOverlay(blueprintContainer, this.timelineRunner);
    this.quizMode = new QuizMode(quizContainer);

    this.practicePage = new PracticePage({
      container: practiceContainer,
      onSwitchTo3D: () => this.switchTo3DView(),
      commandEngine: this.commandEngine,
      timelineRunner: this.timelineRunner,
      vEnv: this.vEnv
    });

    this.terminalUI = new TerminalUI(terminalContainer, (cmd) => {
      this.executeCommand(cmd);
    }, this.vEnv);

    this.hudOverlay = new HudOverlay({
      domElement: hudContainer,
      runner: this.timelineRunner,
      cameraManager: this.cameraManager,
      sound: sound,
      onOpenInspector: (stage) => this.inspectorModal.show(stage),
      onOpenGuide: () => this.guideModal.show(),
      onToggleBlueprint: () => this.blueprintOverlay.toggle(),
      onOpenQuiz: () => this.quizMode.show(),
      onOpenMissions: () => this.missionsModal.toggle(),
      onOpenPractice: () => this.switchToPracticePage()
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
    };

    this.timelineRunner.onPlayStateChange = (isPlaying) => {
      this.hudOverlay.updatePlayState(isPlaying);
    };
  }

  setupGlobalKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) {
        return; // Don't intercept when actively typing in terminal or search inputs
      }

      switch (e.key) {
        case '1':
          this.cameraManager.transitionTo('overview');
          break;
        case '2':
          this.cameraManager.transitionTo('userspace');
          break;
        case '3':
          this.cameraManager.transitionTo('syscall');
          break;
        case '4':
          this.cameraManager.transitionTo('kernel');
          break;
        case '5':
          this.cameraManager.transitionTo('vfs');
          break;
        case ' ':
          e.preventDefault();
          if (this.timelineRunner.isPlaying) {
            this.timelineRunner.pause();
          } else {
            this.timelineRunner.play();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.timelineRunner.stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.timelineRunner.stepBackward();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          this.timelineRunner.stop();
          if (this.timelineRunner.currentPlan) {
            this.timelineRunner.loadPlan(this.timelineRunner.currentPlan);
          }
          break;
      }
    });
  }

  switchToPracticePage() {
    this.is3DActive = false;
    document.getElementById('app-viewport').classList.add('hidden');
    document.getElementById('hud-container').classList.add('hidden');
    document.getElementById('terminal-dock').classList.add('hidden');
    document.getElementById('blueprint-container').classList.add('hidden');
    this.practicePage.show();
    this.practicePage.updatePrompt();
    this.practicePage.updateVFSExplorer();
  }

  switchTo3DView() {
    this.is3DActive = true;
    this.practicePage.hide();
    document.getElementById('app-viewport').classList.remove('hidden');
    document.getElementById('hud-container').classList.remove('hidden');
    document.getElementById('terminal-dock').classList.remove('hidden');
    if (this.terminalUI) {
      this.terminalUI.updatePrompt();
    }
  }

  executeCommand(cmdText, result = null) {
    const plan = this.commandEngine.getCommandPlan(cmdText);
    if (!plan) return;

    this.hudOverlay.updatePlan(plan);
    this.timelineRunner.loadPlan(plan);
    this.timelineRunner.play();

    // Check if command matches any 1000 Missions task
    if (this.missionsModal) {
      const trimmed = cmdText.trim();
      const matched = LINUX_100_COMMANDS.find(c => 
        c.command.toLowerCase() === trimmed.toLowerCase() ||
        c.name.toLowerCase() === trimmed.toLowerCase() ||
        c.name.split(/\s+/)[0].toLowerCase() === trimmed.split(/\s+/)[0].toLowerCase()
      );
      if (matched) {
        this.missionsModal.markMissionDoneById(matched.id);
      }
    }
  }

  startAnimationLoop() {
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Update TWEEN animations
      TWEEN.update();

      // Only render 3D frames if viewport is active and tab is visible
      if (!document.hidden && this.is3DActive) {
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
      }
    };

    animate();
  }
}

// Launch application on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
