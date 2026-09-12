# Deployment & Production Hosting Guide

This guide describes how to deploy, bundle, and serve the **3D Linux Terminal Internals Visualizer** across production hosting platforms.

---

## 1. Build Pipeline & Requirements

The project is built on **Vite** and compiles standard ES6+ modules into an optimized static bundle.

### Prerequisites:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Build Commands:
```bash
# Install dependencies
npm install

# Run development server with Hot Module Replacement (HMR)
npm run dev

# Compile production bundle to /dist
npm run build

# Preview production build locally
npm run preview
```

---

## 2. Deploying to Vercel

The repository includes a pre-configured `vercel.json` file.

### Step-by-Step Deployment:
1. Ensure the Vercel CLI is installed:
   ```bash
   npm i -g vercel
   ```
2. Deploy to a preview branch:
   ```bash
   vercel
   ```
3. Deploy directly to production:
   ```bash
   vercel --prod
   ```

### Recommended `vercel.json` Configuration:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "cleanUrls": true
}
```

---

## 3. Cloudflare Tunnel Integration

For local demoing and secure tunneling without port forwarding:
```bash
# Start Vite local server
npm run dev -- --port 3000

# Expose port via Cloudflare Tunnel
./cloudflared tunnel --url http://localhost:3000
```
This generates a temporary public HTTPS URL providing secure, zero-latency access to the local instance.

---

## 4. Docker & Nginx Deployment

To containerize the application as a standalone static web server:

### Dockerfile:
```dockerfile
# Stage 1: Build static assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Build & Run:
```bash
docker build -t linux-terminal-3d .
docker run -d -p 8080:80 --name terminal-visualizer linux-terminal-3d
```
