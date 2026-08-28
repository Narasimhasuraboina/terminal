export class InspectorModal {
  constructor(domElement) {
    this.container = domElement;
    this.render();
    this.setupListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay hidden" id="inspector-overlay">
        <div class="modal-card">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-icon">🔬</span>
              <div>
                <h3 class="modal-title" id="insp-title">Component Inspector</h3>
                <span class="modal-sub" id="insp-layer">Architecture Subsystem</span>
              </div>
            </div>
            <button class="modal-close" id="insp-close">✕</button>
          </div>

          <div class="modal-body">
            <div class="modal-section">
              <h4 class="section-heading">Overview & Execution Role</h4>
              <p class="section-p" id="insp-desc">Detailed subsystem explanation...</p>
            </div>

            <div class="modal-grid-2">
              <div class="modal-section">
                <h4 class="section-heading">Linux Kernel C Code & Structs</h4>
                <pre class="code-block"><code id="insp-c-code">// Kernel implementation</code></pre>
              </div>

              <div class="modal-section">
                <h4 class="section-heading">x86_64 Assembly & Registers</h4>
                <pre class="code-block"><code id="insp-asm">// Hardware instructions</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.overlay = this.container.querySelector('#inspector-overlay');
  }

  setupListeners() {
    const closeBtn = this.container.querySelector('#insp-close');
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

  show(meta) {
    if (!meta) return;

    this.container.querySelector('#insp-title').textContent = meta.title || meta.name || 'Architecture Component';
    this.container.querySelector('#insp-layer').textContent = meta.layer || 'Linux Subsystem';
    this.container.querySelector('#insp-desc').textContent = meta.details || meta.explanation || meta.summary || '';
    this.container.querySelector('#insp-c-code').textContent = meta.cCode || meta.codeSnippet || '// No C source available for this step';
    this.container.querySelector('#insp-asm').textContent = meta.asm || (meta.registers ? JSON.stringify(meta.registers, null, 2) : '; User mode instruction stream');

    this.overlay.classList.remove('hidden');
  }

  hide() {
    this.overlay.classList.add('hidden');
  }
}
