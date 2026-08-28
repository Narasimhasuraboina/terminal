export class HudOverlay {
  constructor({ domElement, runner, cameraManager, sound, onOpenInspector, onOpenQuiz, onOpenGuide, onToggleBlueprint }) {
    this.container = domElement;
    this.runner = runner;
    this.cameraManager = cameraManager;
    this.sound = sound;
    this.onOpenInspector = onOpenInspector;
    this.onOpenQuiz = onOpenQuiz;
    this.onOpenGuide = onOpenGuide;
    this.onToggleBlueprint = onToggleBlueprint;
    this.mode = 'simple';

    this.render();
    this.setupListeners();
  }

  render() {
    this.container.innerHTML = `
      <!-- TOP SLIM STATUS HEADER -->
      <div class="hud-top-bar">
        <div class="hud-brand">
          <span class="brand-logo">🐧</span>
          <div class="brand-text">
            <span class="brand-title">HOW LINUX RUNS COMMANDS</span>
            <span class="brand-sub">Interactive 3D Subsystem Visualizer</span>
          </div>
        </div>

        <div class="hud-center-controls">
          <!-- CPU PRIVILEGE RING BADGE -->
          <div class="stat-value ring-badge ring-3" id="hud-ring-val">
            🛡️ RING 3 (USER SPACE)
          </div>

          <button class="hud-action-btn blueprint-btn" id="btn-blueprint">
            <span class="btn-icon">🗺️</span> 2D Circuit Flowchart
          </button>
        </div>

        <div class="hud-top-actions">
          <button class="hud-action-btn guide-btn" id="btn-guide">
            <span class="btn-icon">📖</span> Guide
          </button>
          <button class="hud-action-btn quiz-btn" id="btn-quiz">
            <span class="btn-icon">🎯</span> Quiz
          </button>
          <button class="hud-action-btn" id="btn-sound-toggle">
            <span class="btn-icon" id="sound-icon">🔊</span>
          </button>
        </div>
      </div>

      <!-- SIDEWAYS LIVE PROCESS STORY PANEL (RIGHT SIDEBAR) -->
      <div class="side-process-panel" id="side-process-panel">
        <div class="side-panel-header">
          <div class="side-badge-group">
            <span class="side-step-badge" id="dir-step-badge">STEP 1 OF 8</span>
            <span class="side-layer-badge" id="dir-layer-badge">USER SPACE</span>
          </div>
          <span class="side-syscall-badge" id="dir-syscall-badge">NO SYSCALL (USER MODE)</span>
        </div>

        <!-- ONGOING PROCESS HEADLINE -->
        <h2 class="side-process-title" id="dir-title">1. You Type "ls -la" on Keyboard</h2>
        
        <!-- ONGOING PROCESS EXPLANATION -->
        <p class="side-process-desc" id="dir-desc">
          When you press Enter, your terminal emulator captures raw characters and delivers them to the shell.
        </p>

        <!-- ANALOGY -->
        <div class="side-analogy-card" id="dir-analogy">
          💡 Analogy: Writing down your food order on a notepad at a restaurant.
        </div>

        <!-- STEP PROGRESSION HIGHWAY -->
        <div class="side-stepper-title">EXECUTION PROGRESS</div>
        <div class="side-stepper-wrap" id="dir-stepper">
          <!-- Dynamic Step Pills -->
        </div>

        <!-- PACE TIMER LINE -->
        <div class="side-timer-wrap">
          <div class="side-timer-bar" id="dir-timer-bar"></div>
        </div>
      </div>

      <!-- BOTTOM PLAYBACK TIMELINE CONTROLLER -->
      <div class="hud-bottom-bar">
        <div class="timeline-controls">
          <button class="ctrl-btn" id="btn-prev" title="Previous Stage">⏮</button>
          <button class="ctrl-btn ctrl-play" id="btn-play" title="Play / Pause">▶</button>
          <button class="ctrl-btn" id="btn-next" title="Next Stage">⏭</button>
          <button class="ctrl-btn" id="btn-reset" title="Reset Simulation">↺</button>
        </div>

        <div class="timeline-meta">
          <span id="plan-name" class="plan-name">ls -la</span>
          <span id="timeline-step-info" class="step-info">Step 1 of 8</span>
        </div>

        <div class="timeline-settings">
          <div class="speed-selector">
            <button class="speed-btn" data-speed="0.5">Slow (0.5x)</button>
            <button class="speed-btn active" data-speed="1.0">Normal (1.0x)</button>
            <button class="speed-btn" data-speed="2.0">Fast (2.0x)</button>
          </div>

          <div class="camera-presets-group">
            <button class="cam-btn" data-cam="overview" title="Full Motherboard">🌐 Overview</button>
            <button class="cam-btn" data-cam="userspace" title="Terminal & Shell">🖥️ Terminal</button>
            <button class="cam-btn" data-cam="syscall" title="Syscall Security Gate">🛡️ Gate</button>
            <button class="cam-btn" data-cam="kernel" title="CPU & RAM Memory">🧠 CPU/RAM</button>
            <button class="cam-btn" data-cam="vfs" title="NVMe SSD Storage">💾 SSD</button>
          </div>

          <button class="toggle-cam-follow active" id="btn-toggle-cam" title="Auto-Follow Active Hardware">
            🎥 Follow: ON
          </button>
        </div>
      </div>
    `;
  }

  setupListeners() {
    const playBtn = this.container.querySelector('#btn-play');
    const prevBtn = this.container.querySelector('#btn-prev');
    const nextBtn = this.container.querySelector('#btn-next');
    const resetBtn = this.container.querySelector('#btn-reset');
    const autoCamBtn = this.container.querySelector('#btn-toggle-cam');
    const soundBtn = this.container.querySelector('#btn-sound-toggle');
    const quizBtn = this.container.querySelector('#btn-quiz');
    const guideBtn = this.container.querySelector('#btn-guide');
    const blueprintBtn = this.container.querySelector('#btn-blueprint');

    if (blueprintBtn) {
      blueprintBtn.addEventListener('click', () => {
        if (this.onToggleBlueprint) this.onToggleBlueprint();
      });
    }

    playBtn.addEventListener('click', () => {
      if (this.runner.isPlaying) {
        this.runner.pause();
      } else {
        this.runner.play();
      }
    });

    prevBtn.addEventListener('click', () => this.runner.stepBackward());
    nextBtn.addEventListener('click', () => this.runner.stepForward());
    resetBtn.addEventListener('click', () => {
      this.runner.stop();
      if (this.runner.currentPlan) this.runner.loadPlan(this.runner.currentPlan);
    });

    autoCamBtn.addEventListener('click', () => {
      const enabled = this.runner.toggleAutoCamera();
      autoCamBtn.textContent = `🎥 Follow: ${enabled ? 'ON' : 'OFF'}`;
      autoCamBtn.classList.toggle('active', enabled);
    });

    soundBtn.addEventListener('click', () => {
      const isMuted = this.sound.toggleMute();
      soundBtn.querySelector('#sound-icon').textContent = isMuted ? '🔇' : '🔊';
      soundBtn.classList.toggle('muted', isMuted);
    });

    quizBtn.addEventListener('click', () => {
      if (this.onOpenQuiz) this.onOpenQuiz();
    });

    guideBtn.addEventListener('click', () => {
      if (this.onOpenGuide) this.onOpenGuide();
    });

    // Speed selector
    this.container.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = parseFloat(btn.getAttribute('data-speed'));
        this.runner.setSpeed(speed);
      });
    });

    // Camera presets
    this.container.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const camKey = btn.getAttribute('data-cam');
        this.cameraManager.transitionTo(camKey);
      });
    });
  }

  updatePlayState(isPlaying) {
    const playBtn = this.container.querySelector('#btn-play');
    if (playBtn) {
      playBtn.textContent = isPlaying ? '⏸' : '▶';
    }
  }

  updatePlan(plan) {
    const nameEl = this.container.querySelector('#plan-name');
    if (nameEl) nameEl.textContent = plan.name;

    // Render step stepper pills inside Side Process Panel
    const stepper = this.container.querySelector('#dir-stepper');
    if (stepper) {
      stepper.innerHTML = plan.stages.map((stg, idx) => `
        <button class="side-nav-pill ${idx === 0 ? 'active' : ''}" data-step="${idx}">
          <span class="side-nav-num">${idx + 1}</span>
          <span class="side-nav-text">${stg.simpleTitle || `Step ${idx+1}`}</span>
        </button>
      `).join('');

      stepper.querySelectorAll('.side-nav-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const stepIdx = parseInt(btn.getAttribute('data-step'));
          this.runner.jumpToStage(stepIdx);
        });
      });
    }
  }

  updateStage(stage, stageIndex, totalStages) {
    // 1. Privilege Ring Badge
    const ringEl = this.container.querySelector('#hud-ring-val');
    if (ringEl) {
      if (stage.ring === 0) {
        ringEl.className = 'stat-value ring-badge ring-0';
        ringEl.textContent = '⚡ RING 0 (KERNEL MODE)';
      } else {
        ringEl.className = 'stat-value ring-badge ring-3';
        ringEl.textContent = '🛡️ RING 3 (USER MODE)';
      }
    }

    // 2. Active Syscall Badge
    const syscallEl = this.container.querySelector('#dir-syscall-badge');
    if (syscallEl) {
      syscallEl.textContent = stage.syscall ? `SYSCALL: ${stage.syscall}` : 'NO SYSCALL (USER MODE)';
      syscallEl.className = `side-syscall-badge ${stage.syscall ? 'has-syscall' : ''}`;
    }

    // 3. Side Process Panel Content
    const stepBadge = this.container.querySelector('#dir-step-badge');
    const layerBadge = this.container.querySelector('#dir-layer-badge');
    const titleEl = this.container.querySelector('#dir-title');
    const descEl = this.container.querySelector('#dir-desc');
    const analogyEl = this.container.querySelector('#dir-analogy');
    const stepInfoEl = this.container.querySelector('#timeline-step-info');

    if (stepBadge) stepBadge.textContent = `STEP ${stageIndex + 1} OF ${totalStages}`;
    if (layerBadge) layerBadge.textContent = stage.layer.toUpperCase();
    if (titleEl) titleEl.textContent = stage.name;
    if (descEl) descEl.textContent = stage.simpleExplanation || stage.explanation;
    if (analogyEl) analogyEl.textContent = stage.analogy || '💡 Processing operating system request.';
    if (stepInfoEl) stepInfoEl.textContent = `Step ${stageIndex + 1} of ${totalStages}`;

    // 4. Update Nav Pills
    const pills = this.container.querySelectorAll('.side-nav-pill');
    pills.forEach((pill, idx) => {
      pill.classList.toggle('active', idx === stageIndex);
      pill.classList.toggle('passed', idx < stageIndex);
    });

    // 5. Reset & Animate Timer Bar
    const timerBar = this.container.querySelector('#dir-timer-bar');
    if (timerBar) {
      timerBar.style.transition = 'none';
      timerBar.style.width = '0%';
      setTimeout(() => {
        const stepDuration = Math.max(1000, (this.runner.currentPlan?.stages[stageIndex + 1]?.timeOffset || 3200) - stage.timeOffset) / this.runner.speedMultiplier;
        timerBar.style.transition = `width ${stepDuration}ms linear`;
        timerBar.style.width = '100%';
      }, 50);
    }
  }
}
