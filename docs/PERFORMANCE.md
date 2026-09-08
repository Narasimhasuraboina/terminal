# WebGL Rendering Performance & Optimization

Engineering strategies implemented to ensure 60 FPS performance on standard hardware.

## 1. Geometry & Draw Call Optimization
- **Instanced Meshes**: Used for repetitive structural components (memory grid cells, data packets).
- **Buffer Geometry Sharing**: Shared geometries across dynamic nodes to prevent GPU allocation stalls.
- **Disposal Hooks**: Explicitly disposing geometries, materials, and textures when rebuilding layers.

## 2. Event Delegation
- Replaced per-element event listeners with high-performance event delegation on container elements (`#missions-cards-grid`, `#p-missions-list`).
- Avoids memory leaks and reduces garbage collector pressure during large DOM re-renders.

## 3. Code Splitting & Manual Chunks
Vite is configured with `manualChunks` in `vite.config.js`:
- `vendor-three`: Isolates Three.js core library (`~500KB`).
- `vendor-utils`: Groups animation (`@tweenjs/tween.js`) and celebration (`canvas-confetti`) packages.
- `linux-commands-data`: Separates the 1,000-command dataset so initial load time remains instantaneous.

## 4. Canvas Textures
- Rendered using cached HTML5 2D Canvas buffers with high device pixel ratio handling.
- Polyfilled `ctx.roundRect` with fallback to `ctx.rect` for legacy browser compatibility.
