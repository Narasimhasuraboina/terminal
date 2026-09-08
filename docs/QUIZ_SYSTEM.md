# Interactive Terminal Quiz Engine

Specifications for the built-in system call and Linux internals quiz challenge.

## Challenge Structure
- Questions cover:
  - System call identity and register numbers
  - Kernel memory architecture (Virtual vs. Physical, Page Tables, Page Cache)
  - Process lifecycle (`fork`, `execve`, `wait4`, `exit`)
  - File descriptors and IPC pipes
- Immediate visual feedback on answer selection.
- Detailed explanations explaining why an answer is correct in kernel context.

## Gamification & Rewards
- Running streak tracking with consecutive correct answer multiplier.
- Confetti particle bursts using `canvas-confetti` on perfect scores.
- LocalStorage persistence saving highest streak and total completed challenges.
