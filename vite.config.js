import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 3000,
    open: false,
    host: true,
    allowedHosts: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/@tweenjs') || id.includes('node_modules/canvas-confetti')) {
            return 'vendor-utils';
          }
          if (id.includes('src/data/linux')) {
            return 'linux-commands-data';
          }
        }
      }
    }
  }
});
