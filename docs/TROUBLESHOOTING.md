# Troubleshooting & Diagnostics Guide

This document provides resolutions for common runtime issues, WebGL rendering anomalies, and audio restrictions.

---

## 1. WebGL Context Loss & Black Screen

### Symptoms:
The canvas turns completely black or displays `WebGL: CONTEXT_LOST_WEBGL`.

### Causes & Fixes:
- **GPU Driver Crash or Out-of-Memory (OOM)**: 
  The browser forcibly tears down the WebGL context if video memory exceeds hardware limits.
- **Recovery Strategy**:
  The application hooks into `canvas.addEventListener('webglcontextlost', ...)` to prevent default crash behavior:
  ```javascript
  canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('WebGL context lost. Pausing simulation loop.');
  });

  canvas.addEventListener('webglcontextrestored', () => {
      console.info('WebGL context restored. Rebuilding scene buffers.');
      sceneManager.reinitialize();
  });
  ```
- **Fallback**: Ensure hardware acceleration is enabled in your browser settings (`chrome://settings/system`).

---

## 2. Audio Not Playing (Web Audio API Autoplay Policy)

### Symptoms:
Keystroke clicks and simulation sounds are completely silent.

### Causes & Fixes:
- Modern browsers (Chrome, Edge, Safari, Firefox) block audio contexts until the user interacts with the page via a click or keystroke.
- **Resolution**:
  `SoundFX` remains in `suspended` state until the first interaction:
  ```javascript
  if (audioContext.state === 'suspended') {
      audioContext.resume();
  }
  ```
- If audio remains silent, check whether the sound toggle in the HUD is muted (`Sound: OFF`).

---

## 3. Low Framerate & Stuttering (FPS Drops)

### Diagnostics:
Check the FPS counter on the top-right HUD. A healthy render loop runs at 60 FPS.

### Optimization Steps:
1. **Reduce Particle Count**: In lower-end integrated GPUs, reduce the active packet particles in `particleSystem.js`.
2. **Disable Post-Processing**: Turn off Bloom and SSAO effects if running on battery power or mobile GPUs.
3. **PixelRatio Clamping**: Ensure `renderer.setPixelRatio` clamps to a maximum of `2`:
   ```javascript
   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
   ```

---

## 4. Mobile & Touch Input Glitches

### Symptoms:
Orbit controls jitter or keyboard obscures the terminal input on touchscreens.

### Fixes:
- Ensure the viewport meta tag contains `viewport-fit=cover, user-scalable=no`.
- Open the dedicated Mobile Controls drawer to use touch-friendly preset buttons rather than the virtual keyboard.
