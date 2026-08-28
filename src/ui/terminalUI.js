export class TerminalUI {
  constructor(domElement, onRunCommand) {
    this.container = domElement;
    this.onRunCommand = onRunCommand;
    this.history = [];
    this.historyIndex = -1;

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
            <span class="icon">💻</span> bash — 3D Linux Subsystem Explorer
          </div>
          <div class="term-actions">
            <button class="term-btn" id="term-clear-btn" title="Clear screen">Clear</button>
            <button class="term-btn" id="term-toggle-btn" title="Minimize / Expand">_</button>
          </div>
        </div>

        <div class="term-presets">
          <span class="presets-label">⚡ Presets:</span>
          <button class="preset-pill" data-cmd="ls -la">📁 ls -la</button>
          <button class="preset-pill" data-cmd="cat file.txt">📄 cat file.txt</button>
          <button class="preset-pill" data-cmd="grep &quot;WARN&quot; log | wc -l">🔗 grep | wc -l</button>
          <button class="preset-pill" data-cmd="mkdir my_project">📁 mkdir my_project</button>
          <button class="preset-pill" data-cmd="kill -9 1337">⚡ kill -9 1337</button>
          <button class="preset-pill" data-cmd="pwd">📍 pwd (builtin)</button>
          <button class="preset-pill" data-cmd="invalid_cmd">❌ test invalid cmd</button>
        </div>

        <div class="term-body" id="term-output">
          <div class="term-line term-welcome">
            Welcome to <span class="text-cyan">3D Linux Subsystem Internals</span>.<br/>
            Type any Linux command below (e.g. <code>ls -la</code>, <code>uname -a</code>, <code>ping 8.8.8.8</code>, <code>echo "hello"</code>) or test an invalid command to see how Linux handles errors!
          </div>
        </div>

        <div class="term-input-row">
          <span class="term-prompt"><span class="user">user</span>@<span class="host">linux</span>:<span class="path">~</span>$&nbsp;</span>
          <input type="text" id="term-input" class="term-input" placeholder="Type a command (ls -la, ping 8.8.8.8, foobar)..." autocomplete="off" spellcheck="false" />
          <button id="term-exec-btn" class="term-run-btn">Execute ▶</button>
        </div>
      </div>
    `;

    this.outputElement = this.container.querySelector('#term-output');
    this.inputElement = this.container.querySelector('#term-input');
  }

  setupListeners() {
    const input = this.inputElement;
    const execBtn = this.container.querySelector('#term-exec-btn');
    const clearBtn = this.container.querySelector('#term-clear-btn');
    const toggleBtn = this.container.querySelector('#term-toggle-btn');

    // Run on Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitCommand(input.value);
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

  submitCommand(cmdText) {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    this.history.push(trimmed);
    this.historyIndex = -1;
    this.inputElement.value = '';

    if (this.onRunCommand) {
      this.onRunCommand(trimmed);
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
