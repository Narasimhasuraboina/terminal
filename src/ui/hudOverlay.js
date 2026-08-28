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
    this.mode = 'simple'; // 'simple' (Beginner friendly) or 'expert' (C / Assembly / Registers)

    this.render();
    this.setupListeners();
  }

  render() {
    this.container.innerHTML = `
      <!-- TOP HUD BAR -->
      <div class="hud-top-bar">
        <div class="hud-brand">
          <div class="brand-logo">🐧</div>
          <div class="brand-text">
            <span class="brand-title">HOW LINUX RUNS COMMANDS</span>
            <span class="brand-sub" id="brand-sub-text">Interactive Computer Architecture X-Ray</span>
          </div>
        </div>

        <!-- 2D BLUEPRINT BUTTON -->
        <button class="hud-action-btn blueprint-btn" id="btn-blueprint">
          <span class="btn-icon">🗺️</span> 2D Circuit Flowchart
        </button>

        <!-- MODE TOGGLE -->
        <div class="mode-toggle-group">
          <span class="mode-label">Mode:</span>
          <button class="mode-btn ${this.mode === 'simple' ? 'active' : ''}" id="mode-simple-btn">💡 Simple Story</button>
          <button class="mode-btn ${this.mode === 'expert' ? 'active' : ''}" id="mode-expert-btn">⚡ Expert (C / ASM)</button>
        </div>

        <div class="hud-status-group">
          <!-- CPU RING MODE -->
          <div class="hud-stat-box" id="hud-ring-box">
            <span class="stat-label">CPU PRIVILEGE</span>
            <div class="stat-value ring-badge ring-3" id="hud-ring-val">RING 3 (USER)</div>
          </div>

          <!-- ACTIVE SYSCALL -->
          <div class="hud-stat-box">
            <span class="stat-label">ACTIVE SYSCALL</span>
            <div class="stat-value text-magenta" id="hud-syscall-val">NONE (USER CODE)</div>
          </div>

          <!-- CPU REGISTERS (Expert only) -->
          <div class="hud-stat-box hud-regs-box" id="hud-regs-box" style="${this.mode === 'expert' ? '' : 'display:none;'}">
            <span class="stat-label">REGISTERS</span>
            <div class="regs-grid" id="hud-regs-val">
              <span>RIP: <b id="reg-rip">0x7fff4010</b></span>
              <span>RAX: <b id="reg-rax">0x00000000</b></span>
            </div>
          </div>
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

      <!-- STEP BREADCRUMBS HIGHWAY -->
      <div class="step-highway-container" id="step-highway">
        <!-- Dynamic Step Pills injected here -->
      </div>

      <!-- FLOATING STAGE EXPLANATION CARD (TOP RIGHT) -->
      <div class="stage-card" id="stage-card">
        <div class="stage-card-header">
          <span class="stage-badge" id="stage-badge">STEP 1 OF 8 — USER SPACE</span>
          <span class="stage-title" id="stage-title">Capturing Keystrokes</span>
        </div>

        <!-- SIMPLE MODE VIEW -->
        <div id="view-simple-mode">
          <div class="stage-simple-desc" id="stage-simple-desc">
            When you type a command and hit Enter, your terminal app takes the text and sends it to the Shell.
          </div>
          <div class="stage-analogy" id="stage-analogy">
            💡 Analogy: Writing down your food order on a notepad at a restaurant.
          </div>
        </div>

        <!-- EXPERT MODE VIEW -->
        <div id="view-expert-mode" style="${this.mode === 'expert' ? '' : 'display:none;'}">
          <div class="stage-desc" id="stage-desc">
            Technical kernel details...
          </div>
          <div class="stage-code-box" id="stage-code-box">
            <div class="code-tab-header">
              <span class="tab-title">C & Assembly Trace</span>
              <button class="inspect-btn-inline" id="btn-inspect-active">🔍 Inspect Node</button>
            </div>
            <pre><code id="stage-code">write(master_fd, "ls -la\\n", 7);</code></pre>
          </div>
        </div>
      </div>

      <!-- BOTTOM TIMELINE PLAYBACK CONTROLLER -->
      <div class="hud-bottom-bar">
        <div class="timeline-controls">
          <button class="ctrl-btn" id="btn-prev" title="Previous Stage">⏮</button>
          <button class="ctrl-btn ctrl-play" id="btn-play" title="Play / Pause">▶</button>
          <button class="ctrl-btn" id="btn-next" title="Next Stage">⏭</button>
          <button class="ctrl-btn" id="btn-reset" title="Reset Simulation">↺</button>
        </div>

        <div class="timeline-progress-wrap">
          <div class="timeline-info">
            <span id="plan-name" class="plan-name">ls -la</span>
            <span id="timeline-step-info" class="step-info">Step 1 of 8</span>
          </div>
          <div class="timeline-track" id="timeline-track">
            <div class="timeline-fill" id="timeline-fill" style="width: 12%;"></div>
            <div class="timeline-dots" id="timeline-dots"></div>
          </div>
        </div>

        <div class="timeline-settings">
          <div class="speed-selector">
            <button class="speed-btn" data-speed="0.5">0.5x</button>
            <button class="speed-btn active" data-speed="1.0">1.0x</button>
            <button class="speed-btn" data-speed="2.0">2.0x</button>
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
    const inspectBtn = this.container.querySelector('#btn-inspect-active');
    const simpleModeBtn = this.container.querySelector('#mode-simple-btn');
    const expertModeBtn = this.container.querySelector('#mode-expert-btn');

    simpleModeBtn.addEventListener('click', () => this.setMode('simple'));
    expertModeBtn.addEventListener('click', () => this.setMode('expert'));

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

    inspectBtn.addEventListener('click', () => {
      if (this.runner.currentPlan) {
        const stage = this.runner.currentPlan.stages[this.runner.currentStageIndex];
        if (this.onOpenInspector) this.onOpenInspector(stage);
      }
    });

    // Speed buttons
    this.container.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const speed = parseFloat(btn.getAttribute('data-speed'));
        this.runner.setSpeed(speed);
      });
    });

    // Camera preset buttons
    this.container.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const camKey = btn.getAttribute('data-cam');
        this.cameraManager.transitionTo(camKey);
      });
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.container.querySelector('#mode-simple-btn').classList.toggle('active', mode === 'simple');
    this.container.querySelector('#mode-expert-btn').classList.toggle('active', mode === 'expert');

    const simpleView = this.container.querySelector('#view-simple-mode');
    const expertView = this.container.querySelector('#view-expert-mode');
    const regsBox = this.container.querySelector('#hud-regs-box');

    if (simpleView) simpleView.style.display = mode === 'simple' ? 'block' : 'none';
    if (expertView) expertView.style.display = mode === 'expert' ? 'block' : 'none';
    if (regsBox) regsBox.style.display = mode === 'expert' ? 'flex' : 'none';
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

    // Render step highway breadcrumbs
    const highway = this.container.querySelector('#step-highway');
    if (highway) {
      highway.innerHTML = plan.stages.map((stg, idx) => `
        <button class="step-pill ${idx === 0 ? 'active' : ''}" data-step="${idx}">
          <span class="step-num">${idx + 1}</span>
          <span class="step-name">${stg.simpleTitle || stg.name.split('.')[1] || stg.name}</span>
        </button>
      `).join('<span class="step-arrow">➔</span>');

      highway.querySelectorAll('.step-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          const stepIdx = parseInt(btn.getAttribute('data-step'));
          this.runner.jumpToStage(stepIdx);
        });
      });
    }

    // Render timeline dots
    const dotsContainer = this.container.querySelector('#timeline-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      plan.stages.forEach((stage, idx) => {
        const dot = document.createElement('div');
        dot.className = 'timeline-dot';
        dot.title = `Step ${idx + 1}: ${stage.name}`;
        dot.addEventListener('click', () => this.runner.jumpToStage(idx));
        dotsContainer.appendChild(dot);
      });
    }
  }

  updateStage(stage, stageIndex, totalStages) {
    // 1. CPU Privilege Ring Badge
    const ringEl = this.container.querySelector('#hud-ring-val');
    if (ringEl) {
      if (stage.ring === 0) {
        ringEl.className = 'stat-value ring-badge ring-0';
        ringEl.textContent = 'RING 0 (KERNEL)';
      } else {
        ringEl.className = 'stat-value ring-badge ring-3';
        ringEl.textContent = 'RING 3 (USER)';
      }
    }

    // 2. Active Syscall
    const syscallEl = this.container.querySelector('#hud-syscall-val');
    if (syscallEl) {
      syscallEl.textContent = stage.syscall ? stage.syscall : 'NONE (USER CODE)';
    }

    // 3. Registers (Expert)
    if (stage.registers) {
      const ripEl = this.container.querySelector('#reg-rip');
      const raxEl = this.container.querySelector('#reg-rax');
      if (ripEl) ripEl.textContent = stage.registers.RIP || stage.registers.CR3 || '0x7ffff700';
      if (raxEl) raxEl.textContent = stage.registers.RAX || stage.registers.PID || '0x0';
    }

    // 4. Floating Stage Card
    const badgeEl = this.container.querySelector('#stage-badge');
    const titleEl = this.container.querySelector('#stage-title');
    const simpleDescEl = this.container.querySelector('#stage-simple-desc');
    const analogyEl = this.container.querySelector('#stage-analogy');
    const descEl = this.container.querySelector('#stage-desc');
    const codeEl = this.container.querySelector('#stage-code');
    const stepInfoEl = this.container.querySelector('#timeline-step-info');

    if (badgeEl) badgeEl.textContent = `STEP ${stageIndex + 1} OF ${totalStages} — ${stage.layer.toUpperCase()}`;
    if (titleEl) titleEl.textContent = stage.name;
    if (simpleDescEl) simpleDescEl.textContent = stage.simpleExplanation || stage.explanation;
    if (analogyEl) analogyEl.textContent = stage.analogy || '💡 Processing hardware and kernel request.';
    if (descEl) descEl.textContent = stage.explanation;
    if (codeEl) codeEl.textContent = stage.codeSnippet || '// Internal Kernel Transition';
    if (stepInfoEl) stepInfoEl.textContent = `Step ${stageIndex + 1} of ${totalStages}`;

    // 5. Update Highway Active Pill
    const highwayPills = this.container.querySelectorAll('.step-pill');
    highwayPills.forEach((pill, idx) => {
      pill.classList.toggle('active', idx === stageIndex);
      pill.classList.toggle('passed', idx < stageIndex);
    });

    // 6. Timeline fill and active dot
    const fillEl = this.container.querySelector('#timeline-fill');
    if (fillEl) {
      const percent = ((stageIndex + 1) / totalStages) * 100;
      fillEl.style.width = `${percent}%`;
    }

    const dots = this.container.querySelectorAll('.timeline-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === stageIndex);
      dot.classList.toggle('passed', idx < stageIndex);
    });
  }
}
