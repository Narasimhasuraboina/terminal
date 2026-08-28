import * as THREE from 'three';

export class SceneManager {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.width = canvasContainer.clientWidth;
    this.height = canvasContainer.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);
    this.scene.fog = new THREE.FogExp2(0x060913, 0.0075);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
    this.camera.position.set(0, 45, 80);

    // Interactive Raycasting for 3D Node Inspection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];
    this.hoveredObject = null;

    this.initLights();
    this.initEnvironment();
    this.setupEventListeners();
  }

  initLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x18223c, 1.8);
    this.scene.add(ambientLight);

    // Cyan Directional Light
    const dirLight1 = new THREE.DirectionalLight(0x00f3ff, 2.0);
    dirLight1.position.set(30, 60, 40);
    this.scene.add(dirLight1);

    // Magenta Rim Light
    const dirLight2 = new THREE.DirectionalLight(0xff0077, 1.6);
    dirLight2.position.set(-30, 40, -40);
    this.scene.add(dirLight2);

    // Green Accent Light
    const dirLight3 = new THREE.DirectionalLight(0x00ff88, 1.2);
    dirLight3.position.set(0, -30, 20);
    this.scene.add(dirLight3);
  }

  initEnvironment() {
    // Cyberpunk Dual Grid Floor
    const gridHelper = new THREE.GridHelper(240, 60, 0x00f3ff, 0x0c1b33);
    gridHelper.position.y = -8;
    this.scene.add(gridHelper);

    // Floating Hex/Space Particles
    const particleCount = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f3ff);
    const color2 = new THREE.Color(0xff0077);
    const color3 = new THREE.Color(0x00ff88);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 80 - 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const c = Math.random() < 0.4 ? color1 : Math.random() < 0.7 ? color2 : color3;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  registerInteractiveObject(object, meta) {
    object.userData.meta = meta;
    this.interactiveObjects.push(object);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onResize());

    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
      this.checkHover();
    });

    this.container.addEventListener('click', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
      this.handleClick();
    });
  }

  checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      let topObj = intersects[0].object;
      while (topObj && !topObj.userData.meta && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj && topObj.userData.meta) {
        this.container.style.cursor = 'pointer';
        this.hoveredObject = topObj;
        return;
      }
    }
    this.container.style.cursor = 'default';
    this.hoveredObject = null;
  }

  handleClick() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects, true);

    if (intersects.length > 0) {
      let topObj = intersects[0].object;
      while (topObj && !topObj.userData.meta && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj && topObj.userData.meta) {
        if (this.onNodeClick) {
          this.onNodeClick(topObj.userData.meta);
        }
      }
    }
  }

  onResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  update(delta) {
    if (this.particles) {
      this.particles.rotation.y += delta * 0.02;
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
