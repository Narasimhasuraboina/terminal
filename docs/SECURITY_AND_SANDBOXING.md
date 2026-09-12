# Security Architecture & Client-Side Sandboxing

This document outlines the security architecture, memory safety guarantees, and sandbox isolation model of the **3D Linux Terminal Internals Visualizer**.

---

## 1. Threat Model & Sandboxing Principles

The visualizer provides an authentic Linux terminal experience while strictly isolating all execution to the client-side browser runtime.

### Key Guarantees:
1. **Zero Host Execution**: No commands entered in the terminal interface are ever sent to an external operating system or native shell.
2. **In-Memory Virtual File System (VFS)**: Destructive commands like `rm -rf /` or `mkfs.ext4` only mutate an in-memory JavaScript object structure. The host machine is completely untouched.
3. **No Network Telemetry or Exfiltration**: The application does not transmit user command histories, keystrokes, or workspace state to external servers.
4. **Deterministic Sandboxed State**: Resetting or refreshing the browser tab instantly returns the virtual filesystem to its pristine initial state.

---

## 2. Input Sanitization & XSS Defense

Because the terminal outputs dynamic command results, script outputs, and directory listings, strict sanitization prevents Cross-Site Scripting (XSS):

* **HTML Entity Escaping**: All stdout and stderr output streams pass through entity escaping (`&`, `<`, `>`, `"`, `'`) before being appended to the DOM terminal buffer.
* **ANSI Color Parsing**: Terminal color escape codes (e.g., `\x1b[32m` for green text) are converted using a whitelist-only CSS class map rather than raw HTML injection.
* **Content Security Policy (CSP)**: Compatible with strict CSP configurations (`script-src 'self'`, `object-src 'none'`).

---

## 3. Sandboxed VFS Permission Simulation

The VFS (`virtualLinuxEnv.js`) models POSIX octal file permissions (`rwxr-xr-x`) purely for educational demonstration:

```javascript
// Simulated permission verification check
function verifyPermission(node, requiredMode, currentUser) {
  if (currentUser === 'root') return true; // Superuser bypass
  const octal = node.permissions || 0o644;
  // Evaluate user/group/other bitwise flags
  return (octal & requiredMode) !== 0;
}
```

This gives learners accurate feedback (such as `Permission denied` when attempting to edit `/etc/shadow` without `sudo`) without exposing real security vulnerabilities.
