# Testing Strategy & Quality Assurance

This document describes the testing methodologies, suite structure, and quality assurance workflows used across the **3D Linux Terminal Internals Visualizer**.

---

## 1. Testing Philosophy

The test suite prioritizes:
- **Zero Heavy Test Dependencies**: Built using native Node.js assertions (`assert`) for lightning-fast execution (<1 second across the full suite).
- **Comprehensive Catalog Verification**: Every command in the 1,000-command catalog is tested for semantic correctness, category presence, and syscall linkage.
- **State Determinism**: The Virtual File System (VFS) and command engine must produce deterministic state changes across successive invocations.

---

## 2. Test Suite Structure

All tests reside in the `tests/` directory:

| Test File | Scope / Purpose | Key Assertions |
| :--- | :--- | :--- |
| `catalogIntegrity.test.js` | 1,000-command catalog validation | Unique command names, non-empty descriptions, valid category classifications |
| `vfsIntegrity.test.js` | Virtual Linux filesystem operations | Path resolution, inode creation, file read/write, permissions, and directory removal |
| `commandEngine.test.js` | Parser and plan generator | AST tokenization, flag extraction, fallback plan synthesis, and execution steps |
| `syscallMap.test.js` | System call mapping coverage | Valid syscall names, register argument lists, and educational rationale |
| `practiceSandbox.test.js` | Interactive mission verification | Fixture directory validation, scenario files, and guided practice challenges |

---

## 3. Running the Test Suite

Execute the entire test battery via npm:
```bash
npm test
```

To run an individual test module:
```bash
node tests/vfsIntegrity.test.js
```

---

## 4. Visual Regression Testing

For rendering and WebGL verification across browsers, headless testing can be conducted using Chromium:
```bash
# Capture full WebGL canvas screenshot
chromium --headless --screenshot=tests/output/render_verify.png --window-size=1400,900 http://localhost:3000
```
Screenshots are inspected for WebGL shader compilation artifacts, text clipping, and responsive HUD alignment.
