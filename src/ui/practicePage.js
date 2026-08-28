import { LINUX_100_COMMANDS, CATEGORIES } from '../data/linux100Commands.js';
import { VirtualLinuxEnv } from '../simulation/virtualLinuxEnv.js';
import { sound } from '../audio/soundFX.js';
import confetti from 'canvas-confetti';

export class PracticePage {
  constructor({ container, onSwitchTo3D, commandEngine, timelineRunner }) {
    this.container = container;
    this.onSwitchTo3D = onSwitchTo3D;
    this.commandEngine = commandEngine;
    this.timelineRunner = timelineRunner;

    this.vEnv = new VirtualLinuxEnv();
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.currentMissionIndex = 0;
    this.filteredMissions = LINUX_100_COMMANDS;
    this.completedMissions = this.loadProgress();

    this.history = [];
    this.historyIndex = -1;

    this.render();
    this.setupListeners();
    this.updateVFSExplorer();
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

  render() {
    this.container.innerHTML = `
      <div class="practice-layout">
        <!-- TOP NAVIGATION BAR -->
        <header class="practice-top-bar">
          <div class="practice-brand">
            <span class="practice-logo">🐧</span>
            <div>
              <h1 class="practice-header-title">Linux Command Practice Lab</h1>
              <span class="practice-header-sub">Full Interactive Shell & 100 Daily Missions Arena</span>
            </div>
          </div>

          <div class="practice-stats-strip">
            <div class="p-stat">
              <span class="p-stat-label">COMPLETED</span>
              <span class="p-stat-val" id="p-completed-val">0 / 100</span>
            </div>
            <div class="p-progress-track">
              <div class="p-progress-fill" id="p-progress-fill" style="width: 0%"></div>
            </div>
            <div class="p-stat">
              <span class="p-stat-label">TOTAL XP</span>
              <span class="p-stat-val xp" id="p-xp-val">0 XP</span>
            </div>
          </div>

          <div class="practice-top-actions">
            <button class="p-btn-switch-3d" id="btn-back-to-3d" title="Switch to 3D Subsystem View">
              🌐 Switch to 3D Visualizer
            </button>
          </div>
        </header>

        <!-- MAIN TWO-COLUMN WORKSPACE -->
        <div class="practice-main-content">
          <!-- LEFT PANEL: MISSIONS & TASKS EXPLORER -->
          <aside class="practice-sidebar">
            <div class="p-sidebar-header">
              <div class="p-search-box">
                <span class="p-search-icon">🔍</span>
                <input type="text" id="p-mission-search" placeholder="Search 100 practice tasks..." />
              </div>
              <div class="p-cat-pills" id="p-cat-pills">
                <!-- Rendered dynamically -->
              </div>
            </div>

            <!-- Scrollable Missions List -->
            <div class="p-missions-list" id="p-missions-list">
              <!-- Rendered dynamically -->
            </div>
          </aside>

          <!-- RIGHT / CENTER: DEDICATED FULL TERMINAL ARENA -->
          <main class="practice-terminal-arena">
            <!-- ACTIVE MISSION OBJECTIVE HERO CARD -->
            <div class="p-active-mission-card" id="p-active-mission-card">
              <!-- Rendered dynamically -->
            </div>

            <!-- FULL-SIZE INTERACTIVE LINUX TERMINAL CONSOLE -->
            <div class="p-term-window">
              <div class="p-term-header">
                <div class="term-dots">
                  <span class="dot dot-red"></span>
                  <span class="dot dot-yellow"></span>
                  <span class="dot dot-green"></span>
                </div>
                <div class="p-term-title">
                  <span class="icon">⚡</span> bash — Live In-Memory Linux POSIX Terminal
                </div>
                <div class="p-term-actions">
                  <button class="p-term-action-btn" id="p-clear-term-btn">Clear Screen</button>
                  <button class="p-term-action-btn" id="p-reset-env-btn">Reset Filesystem</button>
                </div>
              </div>

              <!-- Terminal Output Stream -->
              <div class="p-term-body" id="p-term-output">
                <div class="p-term-welcome-msg">
                  <pre class="ascii-banner">
  _      _____ _   _ _    ___  __  _____ _____ ___ __  __ ___ _  _   _   _    
 | |    |_   _| \ | | |  | \ \/ / |_   _| ____| _ \  \/  |_ _| \| | /_\ | |   
 | |__    | | |  \| | |__| |>  <    | | |  _| |   / |\/| || || .\` |/ _ \| |__ 
 |____|  _|_|_|_|\__|\____/_/\_\   _|_|_|_____|_|_\_|  |_|___|_|\_/_/ \_\____|
                  </pre>
                  <p>Welcome to your dedicated <strong>Linux Command Practice Arena</strong>!</p>
                  <p>Select any mission on the left, type the command below, and press <strong>Enter</strong> to practice in real time.</p>
                  <p>✨ <em>Supports real directory creation, piping (<code>|</code>), redirection (<code>></code>), and Tab autocompletion.</em></p>
                </div>
              </div>

              <!-- Terminal Input Prompt -->
              <div class="p-term-input-bar">
                <span class="p-term-prompt-txt" id="p-prompt-txt"><span class="p-u">user</span>@<span class="p-h">linux</span>:<span class="p-p" id="p-prompt-pwd">~</span>$&nbsp;</span>
                <input type="text" id="p-term-input" class="p-term-input" placeholder="Type your command here (e.g. ls -la, mkdir project, cat notes.txt)... [Tab = Auto-complete]" autocomplete="off" spellcheck="false" />
                <button id="p-term-run-btn" class="p-run-btn">Run ▶</button>
              </div>

              <!-- Quick Helper Bar / Live VFS Inspector -->
              <div class="p-vfs-bar">
                <span class="p-vfs-label">📁 Current Directory Files:</span>
                <div class="p-vfs-files" id="p-vfs-files">
                  <!-- Rendered dynamically -->
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    `;
  }

  setupListeners() {
    // Back to 3D
    this.container.querySelector('#btn-back-to-3d').addEventListener('click', () => {
      if (this.onSwitchTo3D) this.onSwitchTo3D();
    });

    // Search input
    const searchInput = this.container.querySelector('#p-mission-search');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.filterMissions();
      this.renderMissionsList();
    });

    // Terminal Input
    const input = this.container.querySelector('#p-term-input');
    const runBtn = this.container.querySelector('#p-term-run-btn');
    const clearBtn = this.container.querySelector('#p-clear-term-btn');
    const resetBtn = this.container.querySelector('#p-reset-env-btn');

    input.addEventListener('keydown', (e) => {
      if (e.key.length === 1) sound.playKeyClick();

      if (e.key === 'Enter') {
        this.executeCommand(input.value);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.handleTabCompletion(input);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.history.length > 0) {
          if (this.historyIndex < this.history.length - 1) this.historyIndex++;
          input.value = this.history[this.history.length - 1 - this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          input.value = this.history[this.history.length - 1 - this.historyIndex];
        } else {
          this.historyIndex = -1;
          input.value = '';
        }
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        this.container.querySelector('#p-term-output').innerHTML = '';
      }
    });

    runBtn.addEventListener('click', () => {
      this.executeCommand(input.value);
    });

    clearBtn.addEventListener('click', () => {
      this.container.querySelector('#p-term-output').innerHTML = '';
    });

    resetBtn.addEventListener('click', () => {
      this.vEnv = new VirtualLinuxEnv();
      this.appendOutput('[System: Virtual filesystem reset to default state.]', false);
      this.updatePrompt();
      this.updateVFSExplorer();
    });

    this.renderCategoryPills();
    this.filterMissions();
    this.renderMissionsList();
    this.renderActiveMission();
    this.updateStats();
  }

  filterMissions() {
    this.filteredMissions = LINUX_100_COMMANDS.filter(cmd => {
      const matchCat = this.selectedCategory === 'all' || cmd.category === this.selectedCategory;
      const matchSearch = !this.searchQuery || 
        cmd.name.toLowerCase().includes(this.searchQuery) ||
        cmd.title.toLowerCase().includes(this.searchQuery) ||
        cmd.mission.toLowerCase().includes(this.searchQuery) ||
        cmd.hint.toLowerCase().includes(this.searchQuery);
      return matchCat && matchSearch;
    });

    if (this.currentMissionIndex >= this.filteredMissions.length) {
      this.currentMissionIndex = 0;
    }
  }

  renderCategoryPills() {
    const pillsContainer = this.container.querySelector('#p-cat-pills');
    pillsContainer.innerHTML = '';

    CATEGORIES.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `p-cat-pill ${this.selectedCategory === cat.id ? 'active' : ''}`;
      btn.textContent = cat.name.split(' (')[0];
      btn.addEventListener('click', () => {
        this.selectedCategory = cat.id;
        this.renderCategoryPills();
        this.filterMissions();
        this.renderMissionsList();
        this.renderActiveMission();
      });
      pillsContainer.appendChild(btn);
    });
  }

  renderMissionsList() {
    const listEl = this.container.querySelector('#p-missions-list');
    listEl.innerHTML = '';

    if (this.filteredMissions.length === 0) {
      listEl.innerHTML = `<div class="p-empty-list">No tasks match "${this.searchQuery}"</div>`;
      return;
    }

    this.filteredMissions.forEach((cmd, idx) => {
      const isCompleted = !!this.completedMissions[cmd.id];
      const isSelected = idx === this.currentMissionIndex;

      const item = document.createElement('div');
      item.className = `p-mission-item ${isSelected ? 'active' : ''} ${isCompleted ? 'done' : ''}`;
      item.innerHTML = `
        <div class="p-item-left">
          <span class="p-item-num">${idx + 1}</span>
          <div class="p-item-text">
            <span class="p-item-title">${cmd.title}</span>
            <code class="p-item-code">${cmd.command}</code>
          </div>
        </div>
        <span class="p-item-status">${isCompleted ? '✓' : `+${cmd.xp}XP`}</span>
      `;

      item.addEventListener('click', () => {
        this.currentMissionIndex = idx;
        this.renderMissionsList();
        this.renderActiveMission();
      });

      listEl.appendChild(item);
    });
  }

  renderActiveMission() {
    const cardEl = this.container.querySelector('#p-active-mission-card');
    const cmd = this.filteredMissions[this.currentMissionIndex];

    if (!cmd) {
      cardEl.innerHTML = `<div class="p-no-mission">Select a mission on the left to start practicing.</div>`;
      return;
    }

    const isCompleted = !!this.completedMissions[cmd.id];

    // Extract flags and arguments for the flags breakdown
    const parts = cmd.command.split(/\s+/);
    const cmdBinary = parts[0];
    const cmdFlags = parts.slice(1).filter(p => p.startsWith('-'));
    const cmdArgs = parts.slice(1).filter(p => !p.startsWith('-'));

    cardEl.innerHTML = `
      <div class="p-card-top">
        <div class="p-card-badge-group">
          <span class="p-badge-mission-num">MISSION #${this.currentMissionIndex + 1}</span>
          <span class="p-badge-cat">${cmd.categoryName}</span>
          ${isCompleted ? '<span class="p-badge-completed">✓ COMPLETED</span>' : `<span class="p-badge-xp">+${cmd.xp} XP REWARD</span>`}
        </div>
        <h2 class="p-card-title">${cmd.title}</h2>
      </div>

      <!-- STEP-BY-STEP INSTRUCTIONS -->
      <div class="p-instructions-box">
        <div class="p-instructions-header">
          <span class="p-instructions-badge">📝 INSTRUCTIONS & WORKFLOW</span>
          <span class="p-instructions-scenario">Scenario: Real-world System Administration</span>
        </div>
        <div class="p-steps-list">
          <div class="p-step-item">
            <span class="p-step-bullet">1</span>
            <div class="p-step-body">
              <strong>Objective:</strong> ${cmd.mission}
            </div>
          </div>
          <div class="p-step-item">
            <span class="p-step-bullet">2</span>
            <div class="p-step-body">
              <strong>How to execute:</strong> Type the command into the practice terminal below or click <em>Load into Terminal</em>.
            </div>
          </div>
          <div class="p-step-item">
            <span class="p-step-bullet">3</span>
            <div class="p-step-body">
              <strong>Verification:</strong> Observe the output stream, verify the exit code, and earn <strong>+${cmd.xp} XP</strong>!
            </div>
          </div>
        </div>
      </div>

      <!-- PROGRESSIVE 3-TIER HINTS ACCORDION -->
      <div class="p-hints-accordion-group">
        <details class="p-hint-accordion">
          <summary class="p-hint-summary">
            <span>💡 Hint 1: Concept & Primary Command</span>
            <span class="p-hint-toggle-icon">▼</span>
          </summary>
          <div class="p-hint-content">
            <p>Use the <code>${cmdBinary}</code> utility in Linux. It communicates with the kernel via <code>${cmd.syscall || 'POSIX syscalls'}</code>.</p>
          </div>
        </details>

        <details class="p-hint-accordion">
          <summary class="p-hint-summary">
            <span>⚙️ Hint 2: Flags & Parameter Breakdown</span>
            <span class="p-hint-toggle-icon">▼</span>
          </summary>
          <div class="p-hint-content">
            <p>${cmd.hint}</p>
            <div class="p-flags-chips">
              <span class="p-flag-chip"><strong>Binary:</strong> <code>${cmdBinary}</code></span>
              ${cmdFlags.length > 0 ? `<span class="p-flag-chip"><strong>Flags:</strong> <code>${cmdFlags.join(' ')}</code></span>` : ''}
              ${cmdArgs.length > 0 ? `<span class="p-flag-chip"><strong>Args:</strong> <code>${cmdArgs.join(' ')}</code></span>` : ''}
            </div>
          </div>
        </details>

        <details class="p-hint-accordion">
          <summary class="p-hint-summary">
            <span>🔑 Hint 3: Full Solution & Target Syntax</span>
            <span class="p-hint-toggle-icon">▼</span>
          </summary>
          <div class="p-hint-content solution">
            <p>Type this exact command into the terminal:</p>
            <div class="p-solution-row">
              <code class="p-target-code">${cmd.command}</code>
              <button class="p-mini-copy-btn" id="p-copy-solution" title="Copy Command">📋 Copy</button>
            </div>
          </div>
        </details>
      </div>

      <!-- KERNEL EXPLANATION & ACTION BUTTONS -->
      <div class="p-card-footer-row">
        <div class="p-kernel-rationale">
          🧠 <strong>Under the Hood:</strong> ${cmd.whyHappeningHere}
        </div>
        <div class="p-card-actions-row">
          <button class="p-action-btn p-btn-fill" id="p-btn-autofill" data-cmd="${cmd.command}">
            ⌨️ Load into Terminal
          </button>
          <button class="p-action-btn p-btn-sim3d" id="p-btn-sim3d">
            🌐 3D Motherboard
          </button>
          <button class="p-action-btn p-btn-toggle-done ${isCompleted ? 'done' : ''}" id="p-btn-toggle-done">
            ${isCompleted ? '✓ Completed' : 'Mark Done'}
          </button>
        </div>
      </div>
    `;

    // Event listeners
    cardEl.querySelector('#p-btn-autofill').addEventListener('click', () => {
      const input = this.container.querySelector('#p-term-input');
      input.value = cmd.command;
      input.focus();
    });

    const copyBtn = cardEl.querySelector('#p-copy-solution');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(cmd.command);
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => copyBtn.textContent = '📋 Copy', 1500);
      });
    }

    cardEl.querySelector('#p-btn-sim3d').addEventListener('click', () => {
      if (this.onSwitchTo3D) {
        this.onSwitchTo3D();
        const plan = this.commandEngine.getCommandPlan(cmd.command);
        if (plan && this.timelineRunner) {
          this.timelineRunner.loadPlan(plan);
          this.timelineRunner.play();
        }
      }
    });

    cardEl.querySelector('#p-btn-toggle-done').addEventListener('click', () => {
      this.toggleMissionDone(cmd);
    });
  }

  toggleMissionDone(cmd) {
    if (this.completedMissions[cmd.id]) {
      delete this.completedMissions[cmd.id];
    } else {
      this.completedMissions[cmd.id] = { completedAt: new Date().toISOString() };
      sound.playSuccess();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    this.saveProgress();
    this.updateStats();
    this.renderMissionsList();
    this.renderActiveMission();
  }

  markMissionDoneById(cmdId) {
    if (!this.completedMissions[cmdId]) {
      this.completedMissions[cmdId] = { completedAt: new Date().toISOString() };
      sound.playSuccess();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      this.saveProgress();
      this.updateStats();
      this.renderMissionsList();
      this.renderActiveMission();
    }
  }

  handleTabCompletion(input) {
    const val = input.value;
    const lastWord = val.split(/\s+/).pop();
    if (!lastWord) return;

    const matches = this.vEnv.getCompletions(lastWord);
    if (matches.length === 1) {
      const completion = matches[0];
      const prefix = val.slice(0, val.length - lastWord.length);
      input.value = prefix + completion;
    } else if (matches.length > 1) {
      this.appendOutput(`${this.getPromptString()}${val}`, false);
      this.appendOutput(matches.join('  '), false);
    }
  }

  getPromptString() {
    return `user@linux:${this.vEnv.getPromptPath()}$ `;
  }

  updatePrompt() {
    const pwdEl = this.container.querySelector('#p-prompt-pwd');
    if (pwdEl) {
      pwdEl.textContent = this.vEnv.getPromptPath();
    }
  }

  updateVFSExplorer() {
    const filesEl = this.container.querySelector('#p-vfs-files');
    if (!filesEl) return;

    const node = this.vEnv.getNode('.');
    if (!node || node.type !== 'dir' || !node.children) {
      filesEl.innerHTML = `<span class="vfs-empty">(empty)</span>`;
      return;
    }

    const items = Object.keys(node.children).sort();
    if (items.length === 0) {
      filesEl.innerHTML = `<span class="vfs-empty">(empty directory)</span>`;
      return;
    }

    filesEl.innerHTML = items.map(name => {
      const child = node.children[name];
      const isDir = child.type === 'dir';
      return `<span class="vfs-item ${isDir ? 'dir' : 'file'}">${isDir ? '📁' : '📄'} ${name}</span>`;
    }).join('');
  }

  executeCommand(cmdText) {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    this.history.push(trimmed);
    this.historyIndex = -1;

    const input = this.container.querySelector('#p-term-input');
    input.value = '';

    // Print command line
    this.appendOutput(`${this.getPromptString()}${trimmed}`, true);

    // Execute in virtual POSIX environment
    const result = this.vEnv.execute(trimmed);

    if (result.output === '\x1b[CLEAR]') {
      this.container.querySelector('#p-term-output').innerHTML = '';
    } else if (result.output) {
      this.appendOutput(result.output, false);
    }

    this.updatePrompt();
    this.updateVFSExplorer();

    // Check if command matches the currently selected active mission or any mission!
    const activeCmd = this.filteredMissions[this.currentMissionIndex];
    if (activeCmd) {
      const isMatch = activeCmd.command.toLowerCase() === trimmed.toLowerCase() ||
                      activeCmd.name.toLowerCase() === trimmed.toLowerCase() ||
                      activeCmd.name.split(/\s+/)[0].toLowerCase() === trimmed.split(/\s+/)[0].toLowerCase();
      if (isMatch) {
        this.markMissionDoneById(activeCmd.id);
        this.appendOutput(`✨ Mission Complete! +${activeCmd.xp} XP Earned.`, false);
      }
    }
  }

  appendOutput(text, isCommand = false) {
    const outputEl = this.container.querySelector('#p-term-output');
    const line = document.createElement('div');
    line.className = isCommand ? 'p-term-line p-cmd-line' : 'p-term-line';
    line.innerHTML = text.replace(/\n/g, '<br/>');
    outputEl.appendChild(line);
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  updateStats() {
    const completed = this.getCompletedCount();
    const total = LINUX_100_COMMANDS.length;
    const pct = Math.round((completed / total) * 100);
    const xp = this.getTotalXP();

    const compEl = this.container.querySelector('#p-completed-val');
    const progEl = this.container.querySelector('#p-progress-fill');
    const xpEl = this.container.querySelector('#p-xp-val');

    if (compEl) compEl.textContent = `${completed} / ${total} (${pct}%)`;
    if (progEl) progEl.style.width = `${pct}%`;
    if (xpEl) xpEl.textContent = `${xp} XP`;
  }

  show() {
    this.container.classList.remove('hidden');
    this.updateStats();
    this.renderCategoryPills();
    this.filterMissions();
    this.renderMissionsList();
    this.renderActiveMission();
    this.updateVFSExplorer();
  }

  hide() {
    this.container.classList.add('hidden');
  }
}
