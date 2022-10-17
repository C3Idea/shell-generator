import { toRadians } from "src/util";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry";
import { ShellParameters } from "./shell-parameters";

export class ShellViewer {
  private scene!:  THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private light!:  THREE.PointLight;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;

  private surfaceGeometry!: ParametricGeometry;
  private surfaceMaterial!: THREE.MeshStandardMaterial;
  private surfaceMesh: THREE.Mesh | undefined;

  private wireframeGeometry!: THREE.WireframeGeometry;
  private wireframeMaterial!: THREE.LineBasicMaterial;
  private wireframeLines: THREE.LineSegments | undefined;

  showWireframe: boolean = true;

  surfaceColor:   string = "#F0F0F0";
  wireframeColor: string = "#000000";

  divisions: number = 100;

  constructor() {
  }

  init(fov: number, near: number, far: number, canvas: HTMLCanvasElement) {
    this.scene  = new THREE.Scene();
    this.scene.background = new THREE.Color("#031926");
    const aspectRatio = canvas.clientWidth / canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(fov, aspectRatio, near, far);
    this.light = new THREE.PointLight("#FFFFFF")
    this.camera.add(this.light);
    this.scene.add(this.camera);
    this.renderer = new THREE.WebGLRenderer(
      { canvas: canvas, preserveDrawingBuffer: true }
    )
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.startRenderingLoop();
    this.setCamera();
  }

  private startRenderingLoop() {
    let viewer: ShellViewer = this;
    (function render() {
      requestAnimationFrame(render);
      viewer.controls.update();
      viewer.renderer.render(viewer.scene, viewer.camera);
    }());
  }

  createGraph(parameters: ShellParameters) {
    this.disposeGraphElements();
    this.createGraphElements(parameters);
  }

  
  private disposeGraphElements(): void {
    this.disposeSurfaceElements();
    this.disposeWireframeElements();
  }

  private disposeSurfaceElements() {
    this.disposeSurfaceMesh();
    this.disposeSurfaceMaterial();
    this.disposeSurfaceGeometry();
  }

  private disposeWireframeElements() {
    this.disposeWireframeLines();
    this.disposeWireframeMaterial();
    this.disposeWireframeGeometry();
  }

  private disposeSurfaceMesh() {
    if (this.surfaceMesh) {
      this.scene.remove(this.surfaceMesh);
      this.surfaceMesh = undefined;
    }
  }

  private disposeSurfaceMaterial() {
    if (this.surfaceMaterial) {
      this.surfaceMaterial.dispose();
    }
  }

  private disposeSurfaceGeometry() {
    if (this.surfaceGeometry) {
      this.surfaceGeometry.dispose();
    }
  }

  private disposeWireframeLines() {
    if (this.wireframeLines) {
      this.scene.remove(this.wireframeLines);
      this.wireframeLines = undefined;
    }
  }

  private disposeWireframeMaterial() {
    if (this.wireframeMaterial) {
      this.wireframeMaterial.dispose();
    }
  }

  private disposeWireframeGeometry() {
    if (this.wireframeGeometry) {
      this.wireframeGeometry.dispose();
    }
  }

  private createGraphElements(parameters: ShellParameters) {
    this.createSurfaceElements(parameters);
    this.createWireframeElements();
  }

  private createSurfaceElements(parameters: ShellParameters) {
    this.createSurfaceGeometry(parameters);
    this.createSurfaceMaterial();
    this.createSurfaceMesh();
  }

  private createSurfaceGeometry(parameters: ShellParameters) {
    this.disposeSurfaceGeometry();
    const divisions  = this.divisions;
    let meshFunction = this.surfaceFunction(parameters);
    this.surfaceGeometry = new ParametricGeometry(meshFunction, divisions, divisions);
    this.surfaceGeometry.center();
    const xmin = this.surfaceGeometry.boundingBox!.min.x;
    const xmax = this.surfaceGeometry.boundingBox!.max.x;
    const xrange = xmax - xmin;
    const xscale = 1.0 / xrange;
    const ymin = this.surfaceGeometry.boundingBox!.min.y;
    const ymax = this.surfaceGeometry.boundingBox!.max.y;
    const yrange = ymax - ymin;
    const yscale = 1.0 / yrange;
    const zmin = this.surfaceGeometry.boundingBox!.min.z;
    const zmax = this.surfaceGeometry.boundingBox!.max.z;
    const zrange = zmax - zmin;
    const zscale = 1.0 / zrange;
    const scale = Math.min(xscale, yscale, zscale);
    this.surfaceGeometry.scale(scale, scale, scale);
  }

  private surfaceFunction(parameters: ShellParameters) {
    const thetaRange = parameters.theta * Math.PI;
    const sRange = 4 * Math.PI;
    const alpha = toRadians(parameters.alpha);
    const beta  = toRadians(parameters.beta);
    const mu    = toRadians(parameters.mu);
    const omega = toRadians(parameters.omega);
    const phi   = toRadians(parameters.phi);
    return function(theta0: number, s0: number, target: THREE.Vector3) {
      const theta = theta0 * thetaRange;
      const s = s0 * sRange;
      const re = 1 / Math.sqrt(Math.pow(Math.cos(s) / parameters.a, 2) + Math.pow(Math.sin(s) / parameters.b, 2));
      const ecot = Math.exp(theta / Math.tan(alpha));
      const x = parameters.d * (
        parameters.A * Math.sin(beta) * Math.cos(theta) + 
        re * Math.cos(s + phi) * Math.cos(theta + omega) -
        re * Math.sin(mu) * Math.sin(s + phi) * Math.sin(theta + omega)
      ) * ecot;
      const y = (
        parameters.A * Math.sin(beta) * Math.sin(theta) +
        re * Math.cos(s + phi) * Math.sin(theta + omega) +
        re * Math.sin(mu) * Math.sin(s + phi) * Math.cos(theta + omega)
      ) * ecot;
      const z = (
        -parameters.A * Math.cos(beta) +
        re * Math.sin(s + phi) * Math.cos(mu)
      ) * ecot;
      if (isNaN(x) || isNaN(y) || isNaN(z)) {  // Not a solution
        target.set(0, 0, 0);
      }
      else {
        target.set(x, y, z);
      }
    }
  }

  private createSurfaceMaterial(): void {
    this.disposeSurfaceMaterial();
    this.surfaceMaterial = new THREE.MeshStandardMaterial(
      { color: this.surfaceColor, side: THREE.DoubleSide }
    );
  }

  private createSurfaceMesh(): void {
    this.disposeSurfaceMesh();
    this.surfaceMesh = new THREE.Mesh(this.surfaceGeometry, this.surfaceMaterial);
    this.scene.add(this.surfaceMesh);
  }

  private createWireframeElements(): void {
    this.createWireframeGeometry();
    this.createWireframeMaterial();
    this.createWireframeLines();
  }

  private createWireframeGeometry(): void {
    this.disposeWireframeGeometry();
    this.wireframeGeometry = new THREE.WireframeGeometry(this.surfaceGeometry);
  }

  private createWireframeMaterial(): void {
    this.disposeWireframeMaterial();
    this.wireframeMaterial = new THREE.LineBasicMaterial(
      { color: this.wireframeColor }
    )
  }

  private createWireframeLines(): void {
    this.disposeWireframeLines();
    this.wireframeLines = new THREE.LineSegments(this.wireframeGeometry, this.wireframeMaterial);
    this.setWireframeVisibility();
  }

  setWireframeVisibility(): void {
    if (this.wireframeLines) {
      if (this.showWireframe) {
        this.scene.add(this.wireframeLines);
      }
      else {
        this.scene.remove(this.wireframeLines);
      }
    }
  }

  private setCamera(): void {
    this.camera.position.set(50, 50, 0);
    this.controls.update();
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.render(this.scene, this.camera);
  }

  updateSurfaceColor() {
    this.createSurfaceMaterial();
    this.createSurfaceMesh();
  }

  updateWireframeColor() {
    this.createWireframeMaterial();
    this.createWireframeLines();
  }

}
