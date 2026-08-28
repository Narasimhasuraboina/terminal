import { VirtualLinuxEnv } from '../simulation/virtualLinuxEnv.js';
import { sound } from '../audio/soundFX.js';

export class TerminalUI {
  constructor(domElement, onRunCommand) {
    this.container = domElement;
    this.onRunCommand = onRunCommand;
    this.history = [];
    this.historyIndex = -1;

    // Real-time Virtual Linux POSIX Shell Environment
    this.vEnv = new VirtualLinuxEnv();

    this.render();
    this.setupListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="term-window">
        <div class="term-header">
          <div class="term-dots">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
          </div>
          <div class="term-title">
            <span class="icon">💻</span> bash — Live Interactive Linux Shell & 3D Practice
          </div>
          <div class="term-actions">
            <button class="term-btn" id="term-clear-btn" title="Clear screen">Clear</button>
            <button class="term-btn" id="term-toggle-btn" title="Minimize / Expand">_</button>
          </div>
        </div>

        <div class="term-presets">
          <span class="presets-label">⚡ Quick Practice:</span>
          <button class="preset-pill" data-cmd="ls -la">📁 ls -la</button>
          <button class="preset-pill" data-cmd="cat notes.txt">📄 cat notes.txt</button>
          <button class="preset-pill" data-cmd="grep &quot;Ring&quot; notes.txt | wc -l">🔗 grep | wc -l</button>
          <button class="preset-pill" data-cmd="mkdir -p demo/src">📁 mkdir -p</button>
          <button class="preset-pill" data-cmd="ps aux">⚡ ps aux</button>
          <button class="preset-pill" data-cmd="uname -a">🧠 uname -a</button>
          <button class="preset-pill" data-cmd="free -h">📊 free -h</button>
          <button class="preset-pill" data-cmd="pwd">📍 pwd</button>
        </div>

        <div class="term-body" id="term-output">
          <div class="term-line term-welcome">
            Welcome to the <span class="text-cyan">Interactive Real-Time Linux Shell</span>.<br/>
            Practice any Linux command directly in real-time (e.g. <code>ls -la</code>, <code>mkdir -p my_dir</code>, <code>cd my_dir</code>, <code>echo "hello" > file.txt</code>, <code>cat file.txt</code>, <code>ps aux</code>, <code>grep</code>, <code>top</code>).<br/>
            ✨ <strong>Features:</strong> Real filesystem tree, live piping (<code>|</code>), redirection (<code>></code>), Tab autocompletion, and synced 3D motherboard data path execution!
          </div>
        </div>

        <div class="term-input-row">
          <span class="term-prompt" id="term-prompt-label"><span class="user">user</span>@<span class="host">linux</span>:<span class="path" id="term-prompt-path">~</span>$&nbsp;</span>
          <input type="text" id="term-input" class="term-input" placeholder="Type Linux command (e.g. ls, mkdir, cd, cat, grep, ps)... [Press Tab for autocomplete]" autocomplete="off" spellcheck="false" />
          <button id="term-exec-btn" class="term-run-btn">Execute ▶</button>
        </div>
      </div>
    `;

    this.outputElement = this.container.querySelector('#term-output');
    this.inputElement = this.container.querySelector('#term-input');
    this.promptPathElement = this.container.querySelector('#term-prompt-path');
  }

  setupListeners() {
    const input = this.inputElement;
    const execBtn = this.container.querySelector('#term-exec-btn');
    const clearBtn = this.container.querySelector('#term-clear-btn');
    const toggleBtn = this.container.querySelector('#term-toggle-btn');

    input.addEventListener('keydown', (e) => {
      // Acoustic typing sound
      if (e.key.length === 1) {
        sound.playKeyClick();
      }

      if (e.key === 'Enter') {
        this.submitCommand(input.value);
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
        this.outputElement.innerHTML = '';
      } else if (e.key === 'c' && e.ctrlKey) {
        this.appendOutput(`${this.getPromptString()}${input.value}^C`, false);
        input.value = '';
      }
    });

    execBtn.addEventListener('click', () => {
      this.submitCommand(input.value);
    });

    clearBtn.addEventListener('click', () => {
      this.outputElement.innerHTML = '';
    });

    toggleBtn.addEventListener('click', () => {
      this.container.classList.toggle('minimized');
    });

    // Preset buttons
    this.container.querySelectorAll('.preset-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        input.value = cmd;
        this.submitCommand(cmd);
      });
    });
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
    if (this.promptPathElement) {
      this.promptPathElement.textContent = this.vEnv.getPromptPath();
    }
  }

  submitCommand(cmdText) {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    this.history.push(trimmed);
    this.historyIndex = -1;
    this.inputElement.value = '';

    // Print command line
    this.appendOutput(`${this.getPromptString()}${trimmed}`, true);

    // 1. Execute in Real-Time Virtual POSIX Linux Environment
    const result = this.vEnv.execute(trimmed);

    if (result.output === '\x1b[CLEAR]') {
      this.outputElement.innerHTML = '';
    } else if (result.output) {
      this.appendOutput(result.output, false);
    }

    // Update prompt path in case of 'cd'
    this.updatePrompt();

    // 2. Trigger 3D Motherboard Simulation
    if (this.onRunCommand) {
      this.onRunCommand(trimmed, result);
    }
  }

  appendOutput(text, isCommand = false) {
    const line = document.createElement('div');
    line.className = isCommand ? 'term-line term-cmd-line' : 'term-line';
    line.innerHTML = text.replace(/\n/g, '<br/>');
    this.outputElement.appendChild(line);
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  }
}
