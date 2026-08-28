import confetti from 'canvas-confetti';
import { sound } from '../audio/soundFX.js';

export class QuizMode {
  constructor(domElement) {
    this.container = domElement;
    this.currentQuestionIdx = 0;
    this.score = 0;

    this.questions = [
      {
        question: "Which CPU instruction initiates the transition from User Space (Ring 3) to Kernel Space (Ring 0) on x86-64 Linux?",
        options: [
          "syscall (or sysenter)",
          "jmp 0x0",
          "push rbp",
          "mov cr3, rax"
        ],
        correct: 0,
        explanation: "The `syscall` instruction (x86_64) saves the instruction pointer (RIP) and flags, switches to the kernel stack, and sets the CPU privilege level to Ring 0."
      },
      {
        question: "When running `ls -la`, which system call is used to read raw directory entries (inode numbers, names, offsets)?",
        options: [
          "getdents64()",
          "select()",
          "socket()",
          "fork()"
        ],
        correct: 0,
        explanation: "`getdents64()` (get directory entries) reads multiple `linux_dirent64` structures from the open directory file descriptor."
      },
      {
        question: "In a pipeline like `cat log.txt | grep ERROR`, how is data passed between the two processes?",
        options: [
          "Through a circular FIFO buffer in Kernel RAM allocated by pipe()",
          "Written to a temporary file on the hard drive",
          "Sent over the local loopback network socket",
          "Shared via global CPU hardware registers"
        ],
        correct: 0,
        explanation: "The `pipe()` syscall allocates a unidirectional FIFO ring buffer in kernel memory. No disk I/O occurs."
      },
      {
        question: "What is the primary difference between `fork()` and `execve()` in Linux process lifecycle?",
        options: [
          "fork() clones the process; execve() replaces the process memory with a new binary",
          "fork() runs on CPU; execve() runs on GPU",
          "fork() reads files; execve() writes files",
          "There is no difference; they are aliases"
        ],
        correct: 0,
        explanation: "`fork()` creates a child process with a new PID and COW memory pages. `execve()` loads an ELF binary, replacing the address space."
      },
      {
        question: "What kernel mechanism prevents physical disk I/O when reading a recently accessed file with `cat`?",
        options: [
          "Kernel Page Cache in RAM",
          "CFS CPU Scheduler",
          "Pseudoterminal (PTY) driver",
          "Interrupt Descriptor Table (IDT)"
        ],
        correct: 0,
        explanation: "The Page Cache caches 4KB file pages in physical RAM. On a cache hit, data is served directly from RAM without touching storage."
      }
    ];

    this.render();
    this.setupListeners();
  }

  render() {
    this.container.innerHTML = `
      <div class="modal-overlay hidden" id="quiz-overlay">
        <div class="modal-card quiz-card">
          <div class="modal-header">
            <div class="modal-title-group">
              <span class="modal-icon">🎯</span>
              <div>
                <h3 class="modal-title">Linux Internals Mastery Quiz</h3>
                <span class="modal-sub" id="quiz-progress-text">Question 1 of 5</span>
              </div>
            </div>
            <button class="modal-close" id="quiz-close">✕</button>
          </div>

          <div class="modal-body" id="quiz-body">
            <!-- Dynamic Question Content -->
          </div>
        </div>
      </div>
    `;

    this.overlay = this.container.querySelector('#quiz-overlay');
  }

  setupListeners() {
    const closeBtn = this.container.querySelector('#quiz-close');
    closeBtn.addEventListener('click', () => this.hide());

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.hide();
    });
  }

  show() {
    this.currentQuestionIdx = 0;
    this.score = 0;
    this.renderQuestion();
    this.overlay.classList.remove('hidden');
  }

  hide() {
    this.overlay.classList.add('hidden');
  }

  renderQuestion() {
    const q = this.questions[this.currentQuestionIdx];
    const total = this.questions.length;
    const body = this.container.querySelector('#quiz-body');
    const progressText = this.container.querySelector('#quiz-progress-text');

    progressText.textContent = `Question ${this.currentQuestionIdx + 1} of ${total} | Score: ${this.score}`;

    body.innerHTML = `
      <div class="quiz-q-box">
        <h4 class="quiz-question">${q.question}</h4>
        <div class="quiz-options-list">
          ${q.options.map((opt, idx) => `
            <button class="quiz-opt-btn" data-idx="${idx}">
              <span class="opt-letter">${String.fromCharCode(65 + idx)}</span>
              <span class="opt-text">${opt}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-feedback hidden" id="quiz-feedback"></div>
      </div>
    `;

    body.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedIdx = parseInt(btn.getAttribute('data-idx'));
        this.handleAnswer(selectedIdx);
      });
    });
  }

  handleAnswer(selectedIdx) {
    const q = this.questions[this.currentQuestionIdx];
    const isCorrect = selectedIdx === q.correct;
    const feedback = this.container.querySelector('#quiz-feedback');
    const buttons = this.container.querySelectorAll('.quiz-opt-btn');

    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) btn.classList.add('opt-correct');
      if (idx === selectedIdx && !isCorrect) btn.classList.add('opt-wrong');
    });

    if (isCorrect) {
      this.score++;
      sound.playSuccess();
    } else {
      sound.playError();
    }

    feedback.className = `quiz-feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
    feedback.innerHTML = `
      <div class="feedback-title">${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</div>
      <div class="feedback-expl">${q.explanation}</div>
      <button class="quiz-next-btn" id="quiz-btn-next">
        ${this.currentQuestionIdx < this.questions.length - 1 ? 'Next Question →' : 'View Final Score 🏆'}
      </button>
    `;
    feedback.classList.remove('hidden');

    this.container.querySelector('#quiz-btn-next').addEventListener('click', () => {
      this.currentQuestionIdx++;
      if (this.currentQuestionIdx < this.questions.length) {
        this.renderQuestion();
      } else {
        this.renderResults();
      }
    });
  }

  renderResults() {
    const total = this.questions.length;
    const body = this.container.querySelector('#quiz-body');
    const progressText = this.container.querySelector('#quiz-progress-text');
    progressText.textContent = `Completed!`;

    // Confetti celebration if high score
    if (this.score >= 3) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      sound.playSuccess();
    }

    body.innerHTML = `
      <div class="quiz-results">
        <div class="results-trophy">${this.score >= 4 ? '👑' : this.score >= 3 ? '🎉' : '📚'}</div>
        <h3 class="results-title">Quiz Completed!</h3>
        <p class="results-score">You scored <b>${this.score}</b> out of <b>${total}</b></p>
        <p class="results-desc">
          ${this.score === 5 ? 'Legendary! You have deep mastery of Linux Kernel internals, syscalls, and x86 architecture.' :
            this.score >= 3 ? 'Great job! You have a solid grasp of process execution, memory, and filesystem layers.' :
            'Good effort! Explore the 3D interactive simulator to deepen your Linux subsystem knowledge.'}
        </p>
        <button class="quiz-restart-btn" id="quiz-btn-restart">Retry Quiz ↺</button>
      </div>
    `;

    this.container.querySelector('#quiz-btn-restart').addEventListener('click', () => {
      this.show();
    });
  }
}
