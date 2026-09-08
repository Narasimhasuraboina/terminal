# Contributing Guidelines

Thank you for helping improve the 3D Linux Terminal Internals visualizer!

## Code Conventions
- **ES Modules**: Use standard `import` / `export` syntax.
- **Three.js Practices**: Always ensure custom geometries and materials are properly tracked and disposed of to prevent memory leaks.
- **JSDoc**: Document all exported classes and public methods with clear parameter descriptions.
- **Semantic Commits**: Use conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `perf:`, `test:`, `chore:`.

## Development Commands
```bash
# Start Vite development server
npm run dev

# Run automated tests
npm test

# Build production bundle
npm run build
```
