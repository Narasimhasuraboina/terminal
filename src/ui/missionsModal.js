import { LINUX_100_COMMANDS, CATEGORIES } from '../data/linux100Commands.js';
import confetti from 'canvas-confetti';
import { sound } from '../audio/soundFX.js';

export class MissionsModal {
  constructor({ timelineRunner, commandEngine, hudOverlay, terminalUI }) {
    this.timelineRunner = timelineRunner;
    this.commandEngine = commandEngine;
    this.hudOverlay = hudOverlay;
    this.terminalUI = terminalUI;

    this.isOpen = false;
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.completedMissions = this.loadProgress();

    this.initDOM();
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('linux_100_completed_missions');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }

  saveProgress() {
    try {
      localStorage.setItem('linux_100_completed_missions', JSON.stringify(this.completedMissions));
    } catch (e) {}
  }

  getCompletedCount() {
    return Object.keys(this.completedMissions).length;
  }

  getTotalXP() {
    return Object.keys(this.completedMissions).reduce((total, id) => {
      const cmd = LINUX_100_COMMANDS.find(c => c.id === id);
      return total + (cmd ? cmd.xp : 50);
    }, 0);
  }

  getUserRank(xp) {
    if (xp >= 5000) return { title: '🐧 Linux Kernel Grandmaster', color: '#ff0055' };
    if (xp >= 3500) return { title: '⚡ Systems Architect', color: '#a855f7' };
    if (xp >= 2000) return { title: '🛡️ DevOps Engineer', color: '#00f3ff' };
    if (xp >= 1000) return { title: '🛠️ SysAdmin Pro', color: '#00ff88' };
    if (xp >= 300) return { title: '🐚 Shell Operator', color: '#fbbf24' };
    return { title: '🌱 Linux Explorer', color: '#94a3b8' };
  }

  initDOM() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'missions-modal';
    this.modalEl.className = 'missions-modal-backdrop hidden';
    this.modalEl.innerHTML = `
      <div class="missions-modal-container">
        <!-- Header Strip -->
        <div class="missions-modal-header">
          <div class="missions-header-left">
            <div class="missions-icon-badge">🎯</div>
            <div>
              <h2 class="missions-title">100 Daily Linux Commands & Practice Missions</h2>
              <p class="missions-subtitle">Hands-on mastery with real-world scenarios, hints, and live 3D hardware simulation</p>
            </div>
          </div>
          <button class="missions-close-btn" id="missions-close-btn">&times;</button>
        </div>

        <!-- Progress & Stats Bar -->
        <div class="missions-stats-bar">
          <div class="missions-stat-item">
            <span class="stat-label">COMPLETED</span>
            <span class="stat-value" id="missions-completed-val">0 / 100</span>
          </div>
          <div class="missions-progress-container">
            <div class="missions-progress-bar" id="missions-progress-bar" style="width: 0%"></div>
          </div>
          <div class="missions-stat-item">
            <span class="stat-label">TOTAL XP</span>
            <span class="stat-value xp-value" id="missions-xp-val">0 XP</span>
          </div>
          <div class="missions-stat-item rank-item">
            <span class="stat-label">RANK</span>
            <span class="stat-value rank-value" id="missions-rank-val">🌱 Linux Explorer</span>
          </div>
        </div>

        <!-- Filter & Search Controls -->
        <div class="missions-controls-row">
          <div class="missions-search-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="missions-search-input" class="missions-search-input" placeholder="Search 100 commands by name, description, flag, or syscall..." />
            <button id="missions-clear-search" class="missions-clear-search hidden">&times;</button>
          </div>
          <div class="missions-category-tabs" id="missions-category-tabs">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- Missions Card Grid -->
        <div class="missions-cards-grid" id="missions-cards-grid">
          <!-- Rendered dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(this.modalEl);

    // Event listeners
    this.modalEl.querySelector('#missions-close-btn').addEventListener('click', () => this.close());
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    const searchInput = this.modalEl.querySelector('#missions-search-input');
    const clearBtn = this.modalEl.querySelector('#missions-clear-search');

    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      clearBtn.classList.toggle('hidden', !this.searchQuery);
      this.renderCards();
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      this.searchQuery = '';
      clearBtn.classList.add('hidden');
      this.renderCards();
      searchInput.focus();
    });

    this.renderCategoryTabs();
    this.renderCards();
    this.updateStats();
  }

  renderCategoryTabs() {
    const tabsContainer = this.modalEl.querySelector('#missions-category-tabs');
    tabsContainer.innerHTML = '';

    CATEGORIES.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `category-tab-btn ${this.selectedCategory === cat.id ? 'active' : ''}`;
      
      // Calculate category progress
      const catCommands = cat.id === 'all' 
        ? LINUX_100_COMMANDS 
        : LINUX_100_COMMANDS.filter(c => c.category === cat.id);
      
      const completedInCat = catCommands.filter(c => this.completedMissions[c.id]).length;
      
      btn.innerHTML = `
        <span class="cat-name">${cat.name}</span>
        <span class="cat-count-badge">${completedInCat}/${catCommands.length}</span>
      `;

      btn.addEventListener('click', () => {
        this.selectedCategory = cat.id;
        this.renderCategoryTabs();
        this.renderCards();
      });

      tabsContainer.appendChild(btn);
    });
  }

  renderCards() {
    const grid = this.modalEl.querySelector('#missions-cards-grid');
    grid.innerHTML = '';

    let filtered = LINUX_100_COMMANDS;

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(this.searchQuery) ||
        c.title.toLowerCase().includes(this.searchQuery) ||
        c.mission.toLowerCase().includes(this.searchQuery) ||
        c.hint.toLowerCase().includes(this.searchQuery) ||
        (c.syscall && c.syscall.toLowerCase().includes(this.searchQuery))
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="missions-empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No matching Linux commands found</h3>
          <p>Try searching for a different keyword like "ls", "grep", "port", "disk", or "kill".</p>
        </div>
      `;
      return;
    }

    filtered.forEach((cmd, idx) => {
      const isCompleted = !!this.completedMissions[cmd.id];
      const card = document.createElement('div');
      card.className = `mission-card ${isCompleted ? 'completed' : ''}`;
      card.id = `mission-card-${cmd.id}`;

      card.innerHTML = `
        <div class="mission-card-header">
          <div class="mission-num-badge">#${idx + 1}</div>
          <div class="mission-title-group">
            <h3 class="mission-card-title">${cmd.title}</h3>
            <span class="mission-cat-tag">${cmd.categoryName}</span>
          </div>
          <div class="mission-status-badge ${isCompleted ? 'done' : ''}">
            ${isCompleted ? '✓ COMPLETED' : `+${cmd.xp} XP`}
          </div>
        </div>

        <p class="mission-card-desc">🎯 <strong>Mission:</strong> ${cmd.mission}</p>

        <!-- Command Pill -->
        <div class="mission-cmd-box">
          <code class="mission-code">${cmd.command}</code>
          <button class="mission-copy-btn" title="Copy command" data-cmd="${cmd.command}">📋 Copy</button>
        </div>

        <!-- Collapsible Hint Section -->
        <details class="mission-hint-details">
          <summary class="mission-hint-summary">💡 View Hint & Flags Explanation</summary>
          <div class="mission-hint-content">
            <p>${cmd.hint}</p>
            ${cmd.syscall ? `<div class="mission-syscall-tag">⚙️ Syscall: <code>${cmd.syscall}</code></div>` : ''}
            <div class="mission-why-tag">🧠 <strong>Why in Kernel:</strong> ${cmd.whyHappeningHere}</div>
          </div>
        </details>

        <!-- Action Buttons Row -->
        <div class="mission-card-actions">
          <button class="mission-action-btn run-3d-btn" data-id="${cmd.id}" data-cmd="${cmd.command}">
            ▶ Run & Simulate in 3D
          </button>
          <button class="mission-action-btn practice-term-btn" data-cmd="${cmd.command}">
            ⌨️ Practice in Terminal
          </button>
          <button class="mission-action-btn toggle-done-btn ${isCompleted ? 'done' : ''}" data-id="${cmd.id}">
            ${isCompleted ? '✓ Done' : 'Mark Done'}
          </button>
        </div>
      `;

      // Event listeners on card buttons
      const copyBtn = card.querySelector('.mission-copy-btn');
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(cmd.command);
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
      });

      const run3dBtn = card.querySelector('.run-3d-btn');
      run3dBtn.addEventListener('click', () => {
        this.close();
        this.runCommandIn3D(cmd);
      });

      const practiceBtn = card.querySelector('.practice-term-btn');
      practiceBtn.addEventListener('click', () => {
        this.close();
        if (this.terminalUI && this.terminalUI.inputEl) {
          this.terminalUI.inputEl.value = cmd.command;
          this.terminalUI.inputEl.focus();
        }
      });

      const toggleDoneBtn = card.querySelector('.toggle-done-btn');
      toggleDoneBtn.addEventListener('click', () => {
        this.toggleMissionDone(cmd);
      });

      grid.appendChild(card);
    });
  }

  toggleMissionDone(cmd) {
    if (this.completedMissions[cmd.id]) {
      delete this.completedMissions[cmd.id];
    } else {
      this.completedMissions[cmd.id] = { completedAt: new Date().toISOString() };
      sound.playSuccess();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    this.saveProgress();
    this.updateStats();
    this.renderCategoryTabs();
    this.renderCards();
  }

  markMissionDoneById(cmdId) {
    if (!this.completedMissions[cmdId]) {
      this.completedMissions[cmdId] = { completedAt: new Date().toISOString() };
      this.saveProgress();
      this.updateStats();
      this.renderCategoryTabs();
      this.renderCards();
    }
  }

  runCommandIn3D(cmd) {
    if (!this.commandEngine || !this.timelineRunner) return;

    // Generate plan
    const plan = this.commandEngine.generatePlan(cmd.command) || {
      name: cmd.command,
      title: cmd.title,
      summaryText: cmd.mission,
      stages: [
        {
          id: 'step_terminal',
          stepNum: 1,
          timeOffset: 0,
          name: `1. Typed "${cmd.command}"`,
          simpleTitle: '1. Keystrokes',
          layer: 'User Space (Terminal)',
          activeNode: 'terminal',
          route: null,
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { RIP: '0x7fff4010', RAX: '0x0' },
          simpleExplanation: `Your terminal captures "${cmd.command}".`,
          explanation: `Captures keystrokes for ${cmd.command}.`,
          whyHappeningHere: 'User input starts in unprivileged User Space (Ring 3).',
          terminalOutput: `user@linux:~$ ${cmd.command}`
        },
        {
          id: 'step_shell',
          stepNum: 2,
          timeOffset: 3000,
          name: `2. Shell Parses "${cmd.name}" & Arguments`,
          simpleTitle: '2. Parse $PATH',
          layer: 'User Space (Bash)',
          activeNode: 'lexer',
          route: { from: 'terminal', to: 'lexer', color: 0x00f3ff },
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'faccessat2()',
          registers: { RIP: '0x5555556a', RAX: '0x2' },
          simpleExplanation: `Shell finds executable binary for ${cmd.name}.`,
          explanation: `Locates executable binary in $PATH.`,
          whyHappeningHere: 'The shell tokenizes arguments in User Space before invoking the kernel.',
          terminalOutput: null
        },
        {
          id: 'step_syscall',
          stepNum: 3,
          timeOffset: 6000,
          name: `3. Invoking ${cmd.syscall || 'Syscall Gateway'}`,
          simpleTitle: '3. Syscall Gate',
          layer: 'Syscall Gateway (Ring 3 ➔ Ring 0)',
          activeNode: 'syscall_dispatcher',
          route: { from: 'path', to: 'syscall', color: 0xff0077 },
          sound: 'syscall',
          cameraTarget: 'syscall',
          ring: 0,
          syscall: cmd.syscall || 'syscall()',
          registers: { RIP: '0xffffffff8100', RAX: '0x3b' },
          simpleExplanation: `CPU elevates to Ring 0 Kernel Mode to execute ${cmd.syscall || 'system call'}.`,
          explanation: `Transfers execution into Ring 0 supervisor mode.`,
          whyHappeningHere: cmd.whyHappeningHere,
          terminalOutput: null
        },
        {
          id: 'step_kernel',
          stepNum: 4,
          timeOffset: 9000,
          name: `4. Kernel Executes on Hardware`,
          simpleTitle: '4. CPU & Storage',
          layer: 'Kernel & VFS Storage',
          activeNode: 'cpu_core',
          route: { from: 'syscall', to: 'cpu', color: 0x2979ff },
          sound: 'kernel',
          cameraTarget: 'kernel',
          ring: 0,
          syscall: null,
          registers: { RIP: '0xffffffff8120', RAX: '0x0' },
          simpleExplanation: `Kernel interacts with CPU, MMU, and storage controllers.`,
          explanation: cmd.whyHappeningHere,
          whyHappeningHere: cmd.whyHappeningHere,
          terminalOutput: null
        },
        {
          id: 'step_output',
          stepNum: 5,
          timeOffset: 12000,
          name: `5. Output Stream Returned to Terminal`,
          simpleTitle: '5. Done',
          layer: 'User Space (Terminal Output)',
          activeNode: 'terminal',
          route: { from: 'cpu', to: 'terminal', color: 0x00f3ff },
          sound: 'success',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'write(1)',
          registers: { RIP: '0x7fff4100', RAX: '0x0' },
          simpleExplanation: `Results printed to terminal standard output.`,
          explanation: `Streams formatted output back to terminal display.`,
          whyHappeningHere: 'Display server renders characters onto monitor screen.',
          terminalOutput: cmd.output ? `user@linux:~$ ${cmd.command}\n${cmd.output}\nuser@linux:~$ ` : `user@linux:~$ ${cmd.command}\nuser@linux:~$ `
        }
      ]
    };

    this.timelineRunner.loadPlan(plan);
    this.timelineRunner.play();

    // Mark as completed!
    this.markMissionDoneById(cmd.id);
  }

  updateStats() {
    const completed = this.getCompletedCount();
    const total = LINUX_100_COMMANDS.length;
    const pct = Math.round((completed / total) * 100);
    const xp = this.getTotalXP();
    const rank = this.getUserRank(xp);

    const compEl = this.modalEl.querySelector('#missions-completed-val');
    const progEl = this.modalEl.querySelector('#missions-progress-bar');
    const xpEl = this.modalEl.querySelector('#missions-xp-val');
    const rankEl = this.modalEl.querySelector('#missions-rank-val');

    if (compEl) compEl.textContent = `${completed} / ${total} (${pct}%)`;
    if (progEl) progEl.style.width = `${pct}%`;
    if (xpEl) xpEl.textContent = `${xp} XP`;
    if (rankEl) {
      rankEl.textContent = rank.title;
      rankEl.style.color = rank.color;
    }

    // Update top HUD badge if available
    if (this.hudOverlay && this.hudOverlay.updateMissionsBadge) {
      this.hudOverlay.updateMissionsBadge(completed, total);
    }
  }

  open() {
    this.isOpen = true;
    this.modalEl.classList.remove('hidden');
    this.updateStats();
    this.renderCategoryTabs();
    this.renderCards();
  }

  close() {
    this.isOpen = false;
    this.modalEl.classList.add('hidden');
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}
