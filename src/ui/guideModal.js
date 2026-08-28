export class GuideModal {
  constructor(domElement) {
    this.container = domElement;
    this.render();
    this.setupListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay hidden" id="guide-overlay">
        <div class="modal-card guide-card">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-icon">📖</span>
              <div>
                <h3 class="modal-title">How Linux Commands Actually Work (The Complete Picture)</h3>
                <span class="modal-sub">Essential Architecture Guide & Mental Model</span>
              </div>
            </div>
            <button class="modal-close" id="guide-close">✕</button>
          </div>

          <div class="modal-body guide-body">
            <!-- Concept 1 -->
            <div class="guide-topic">
              <div class="topic-header">
                <span class="topic-num">1</span>
                <h4>The 5-Act Play of Every Linux Command</h4>
              </div>
              <p>When you type <code>ls -la</code> and press <kbd>Enter</kbd>, 5 distinct phases occur within a few milliseconds:</p>
              <div class="guide-steps-grid">
                <div class="g-step">
                  <b>Phase 1: Shell Reads & Tokenizes</b>
                  <p>Your shell (bash) grabs <code>"ls -la"</code>, parses it into <code>["ls", "-la"]</code>, and searches folders in <code>$PATH</code> to locate <code>/usr/bin/ls</code>.</p>
                </div>
                <div class="g-step">
                  <b>Phase 2: The Fork (Clone)</b>
                  <p>The shell asks Linux kernel to clone an identical child worker process with its own PID via <code>fork()</code>.</p>
                </div>
                <div class="g-step">
                  <b>Phase 3: The Metamorphosis (execve)</b>
                  <p>The child calls <code>execve()</code>. The CPU switches to <b>Ring 0 (Kernel)</b>. The kernel replaces child memory with the compiled machine code of <code>/usr/bin/ls</code>.</p>
                </div>
                <div class="g-step">
                  <b>Phase 4: MMU & Disk Inode Read</b>
                  <p>Virtual memory is mapped. <code>ls</code> calls <code>getdents64()</code> to read directory inodes and file metadata (permissions, sizes, dates).</p>
                </div>
                <div class="g-step">
                  <b>Phase 5: Output Stream & Clean Exit</b>
                  <p><code>ls</code> writes formatted text to File Descriptor 1 (stdout) and exits (code 0). Shell reaps child and shows your prompt!</p>
                </div>
              </div>
            </div>

            <!-- Concept 2 -->
            <div class="guide-topic">
              <div class="topic-header">
                <span class="topic-num">2</span>
                <h4>Ring 3 (User Space) vs. Ring 0 (Kernel Space)</h4>
              </div>
              <p>CPUs have hardware security rings. User programs run in <b>Ring 3</b> and are <i>forbidden</i> from touching RAM directly or talking to the hard drive.</p>
              <div class="ring-compare-box">
                <div class="r-box r-user">
                  <h5>🛡️ Ring 3 (User Space)</h5>
                  <p>Where your terminal, browser, and user commands run. Safe sandbox. If a program crashes (e.g. segfault), only that process dies, not the OS.</p>
                </div>
                <div class="r-divider">➔ <code>syscall</code> ➔</div>
                <div class="r-box r-kernel">
                  <h5>⚡ Ring 0 (Kernel Space)</h5>
                  <p>Where the Linux Kernel, hardware device drivers, page tables, and file systems live. Complete, unrestricted hardware access.</p>
                </div>
              </div>
            </div>

            <!-- Concept 3 -->
            <div class="guide-topic">
              <div class="topic-header">
                <span class="topic-num">3</span>
                <h4>Why is "cd" Built Into the Shell (and not a /bin/cd file)?</h4>
              </div>
              <p>In Linux, a child process <b>cannot modify the environment or working directory of its parent process</b>!</p>
              <p>If <code>cd</code> were an external program on disk (like <code>/bin/cd</code>), the shell would fork a child, the child would change its own directory, and then exit—leaving your shell right where it started! That is why <code>cd</code>, <code>export</code>, and <code>exit</code> must run directly inside the shell process context (Shell Builtins).</p>
            </div>

            <!-- Concept 4 -->
            <div class="guide-topic">
              <div class="topic-header">
                <span class="topic-num">4</span>
                <h4>How Unix Pipelines Work: "cmd1 | cmd2"</h4>
              </div>
              <p>A pipeline does <b>not</b> write temporary files to your SSD! Instead:</p>
              <ul class="guide-list">
                <li><code>pipe()</code> allocates a 64KB circular ring buffer in Kernel RAM.</li>
                <li>Both programs run <b>concurrently at the exact same time</b> on multiple CPU cores.</li>
                <li><code>dup2()</code> wires Program 1's standard output straight into the pipe, and Program 2's standard input to read from the pipe.</li>
                <li>When Program 1 writes bytes, the CPU wakes up Program 2 to read them instantly!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    this.overlay = this.container.querySelector('#guide-overlay');
  }

  setupListeners() {
    const closeBtn = this.container.querySelector('#guide-close');
    closeBtn.addEventListener('click', () => this.hide());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.overlay.classList.contains('hidden')) {
        this.hide();
      }
    });
  }

  show() {
    this.overlay.classList.remove('hidden');
  }

  hide() {
    this.overlay.classList.add('hidden');
  }
}
