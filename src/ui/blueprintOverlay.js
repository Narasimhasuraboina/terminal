export class BlueprintOverlay {
  constructor(domElement, runner) {
    this.container = domElement;
    this.runner = runner;
    this.visible = false;

    this.render();
    this.setupListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="blueprint-overlay hidden" id="blueprint-overlay">
        <div class="blueprint-card">
          <div class="blueprint-header">
            <div class="bp-title-group">
              <span class="bp-icon">🗺️</span>
              <div>
                <h3 class="bp-title">Computer Architecture Flowchart (Real-Time X-Ray)</h3>
                <span class="bp-sub">Follow the green energy pulse across the 4 physical components of your computer</span>
              </div>
            </div>
            <button class="bp-close" id="bp-close">✕ Close Blueprint</button>
          </div>

          <div class="blueprint-canvas-wrap">
            <!-- 4 HARDWARE BLOCKS -->
            <div class="bp-grid">
              
              <!-- BLOCK 1: TERMINAL & KEYBOARD -->
              <div class="bp-block" id="bp-node-terminal">
                <div class="bp-block-header">
                  <span class="bp-block-icon">🖥️</span>
                  <span class="bp-block-title">1. User Terminal</span>
                </div>
                <div class="bp-block-content">
                  <div class="bp-badge">User Space (Ring 3)</div>
                  <p class="bp-text">Captures keyboard keystrokes and prints text output to your screen.</p>
                  <div class="bp-tag" id="bp-tag-terminal">IDLE</div>
                </div>
              </div>

              <!-- ARROW 1 -->
              <div class="bp-connector" id="bp-conn-1">
                <span class="bp-arrow-line">──────►</span>
                <span class="bp-wire-label">1. Parse Command</span>
              </div>

              <!-- BLOCK 2: SHELL & $PATH -->
              <div class="bp-block" id="bp-node-lexer">
                <div class="bp-block-header">
                  <span class="bp-block-icon">🐚</span>
                  <span class="bp-block-title">2. Shell (Bash)</span>
                </div>
                <div class="bp-block-content">
                  <div class="bp-badge">User Space (Ring 3)</div>
                  <p class="bp-text">Splits command into tokens. Checks $PATH to find where program lives on disk.</p>
                  <div class="bp-tag" id="bp-tag-lexer">IDLE</div>
                </div>
              </div>

              <!-- ARROW 2 -->
              <div class="bp-connector" id="bp-conn-2">
                <span class="bp-arrow-line">──────►</span>
                <span class="bp-wire-label">2. Syscall (Ring 0)</span>
              </div>

              <!-- BLOCK 3: SYSCALL GATEWAY -->
              <div class="bp-block" id="bp-node-syscall">
                <div class="bp-block-header">
                  <span class="bp-block-icon">🛡️</span>
                  <span class="bp-block-title">3. Syscall Gate (fork/exec)</span>
                </div>
                <div class="bp-block-content">
                  <div class="bp-badge badge-kernel">Kernel Boundary</div>
                  <p class="bp-text">Switches CPU to Ring 0. Clones worker process (fork) & loads binary (execve).</p>
                  <div class="bp-tag" id="bp-tag-syscall">IDLE</div>
                </div>
              </div>

              <!-- ARROW 3 -->
              <div class="bp-connector" id="bp-conn-3">
                <span class="bp-arrow-line">──────►</span>
                <span class="bp-wire-label">3. Load into RAM</span>
              </div>

              <!-- BLOCK 4: CPU & RAM -->
              <div class="bp-block" id="bp-node-cpu">
                <div class="bp-block-header">
                  <span class="bp-block-icon">🧠</span>
                  <span class="bp-block-title">4. CPU & RAM (MMU)</span>
                </div>
                <div class="bp-block-content">
                  <div class="bp-badge badge-kernel">Hardware Execution</div>
                  <p class="bp-text">Maps virtual memory (.text, .data, stack). CPU executes machine instructions.</p>
                  <div class="bp-tag" id="bp-tag-cpu">IDLE</div>
                </div>
              </div>

              <!-- ARROW 4 -->
              <div class="bp-connector" id="bp-conn-4">
                <span class="bp-arrow-line">──────►</span>
                <span class="bp-wire-label">4. Read Inodes</span>
              </div>

              <!-- BLOCK 5: STORAGE / NVMe SSD -->
              <div class="bp-block" id="bp-node-storage">
                <div class="bp-block-header">
                  <span class="bp-block-icon">💾</span>
                  <span class="bp-block-title">5. NVMe SSD / Disk</span>
                </div>
                <div class="bp-block-content">
                  <div class="bp-badge badge-storage">Hardware Storage</div>
                  <p class="bp-text">VFS reads directory Inodes from ext4 or fetches cached files from RAM Page Cache.</p>
                  <div class="bp-tag" id="bp-tag-storage">IDLE</div>
                </div>
              </div>

            </div>

            <!-- LIVE EXPLANATION CALLOUT -->
            <div class="bp-live-card">
              <div class="bp-live-header">
                <span class="bp-live-badge" id="bp-live-step">CURRENT STEP</span>
                <h4 class="bp-live-title" id="bp-live-title">Select a command below to watch execution</h4>
              </div>
              <p class="bp-live-desc" id="bp-live-desc">
                When you run a command, this blueprint will light up the exact physical component performing the work in real-time.
              </p>
              
              <div class="bp-live-why" id="bp-live-why-wrap">
                <span class="bp-why-label">❓ WHY AT THIS HARDWARE POINT:</span>
                <p class="bp-why-text" id="bp-live-why">Hardware isolation keeps your system stable.</p>
              </div>

              <div class="bp-live-analogy" id="bp-live-analogy">
                💡 Real World Analogy: Think of your computer as a restaurant—you order at the counter (Terminal), the cashier finds the recipe (Shell), kitchen manager assigns a cook (Syscall/Fork), cook works on the counter (CPU/RAM), and ingredients are in the pantry (SSD).
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.overlay = this.container.querySelector('#blueprint-overlay');
  }

  setupListeners() {
    const closeBtn = this.container.querySelector('#bp-close');
    closeBtn.addEventListener('click', () => this.hide());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });
  }

  show() {
    this.visible = true;
    this.overlay.classList.remove('hidden');
    if (this.runner.currentPlan) {
      const stage = this.runner.currentPlan.stages[this.runner.currentStageIndex];
      this.updateStage(stage, this.runner.currentStageIndex, this.runner.currentPlan.stages.length);
    }
  }

  hide() {
    this.visible = false;
    this.overlay.classList.add('hidden');
  }

  toggle() {
    if (this.visible) this.hide();
    else this.show();
    return this.visible;
  }

  updateStage(stage, stageIndex, totalStages) {
    if (!this.overlay) return;

    // Reset all blocks
    const blocks = ['terminal', 'lexer', 'syscall', 'cpu', 'storage'];
    blocks.forEach(id => {
      const node = this.container.querySelector(`#bp-node-${id}`);
      const tag = this.container.querySelector(`#bp-tag-${id}`);
      if (node) node.classList.remove('active', 'error');
      if (tag) {
        tag.textContent = 'IDLE';
        tag.className = 'bp-tag';
      }
    });

    // Determine active block
    let activeId = 'terminal';
    const n = stage.activeNode || '';
    if (n === 'terminal') activeId = 'terminal';
    else if (n === 'lexer' || n === 'path') activeId = 'lexer';
    else if (n === 'syscall_dispatcher' || n === 'fork' || n === 'execve' || n === 'fd_table') activeId = 'syscall';
    else if (n === 'cpu_core' || n === 'mmu_memory' || n === 'scheduler') activeId = 'cpu';
    else if (n === 'vfs_tree' || n === 'page_cache' || n === 'storage_disk' || n === 'disk') activeId = 'storage';

    const activeNodeEl = this.container.querySelector(`#bp-node-${activeId}`);
    const activeTagEl = this.container.querySelector(`#bp-tag-${activeId}`);
    const isErr = stage.sound === 'error';

    if (activeNodeEl) {
      activeNodeEl.classList.add(isErr ? 'error' : 'active');
    }
    if (activeTagEl) {
      activeTagEl.textContent = isErr ? 'ERROR / STOP' : 'PROCESSING';
      activeTagEl.className = `bp-tag ${isErr ? 'tag-error' : 'tag-active'}`;
    }

    // Update live text card
    const stepEl = this.container.querySelector('#bp-live-step');
    const titleEl = this.container.querySelector('#bp-live-title');
    const descEl = this.container.querySelector('#bp-live-desc');
    const whyEl = this.container.querySelector('#bp-live-why');
    const analogyEl = this.container.querySelector('#bp-live-analogy');

    if (stepEl) stepEl.textContent = `STEP ${stageIndex + 1} OF ${totalStages} — ${stage.layer.toUpperCase()}`;
    if (titleEl) titleEl.textContent = stage.simpleTitle || stage.name;
    if (descEl) descEl.textContent = stage.simpleExplanation || stage.explanation;
    if (whyEl) whyEl.textContent = stage.whyHappeningHere || 'Executes at this specific hardware subsystem to maintain CPU privilege isolation and system stability.';
    if (analogyEl) analogyEl.textContent = stage.analogy || '💡 Processing hardware and kernel request.';
  }
}
