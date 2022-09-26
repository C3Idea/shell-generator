import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';
import { SurfaceParameters } from './surface.parameters';
import { toRadians, random } from '../../util'

@Component({
  selector: 'app-surface',
  templateUrl: './surface.component.html',
  styleUrls: ['./surface.component.css']
})



export class SurfaceComponent implements AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef;
  @ViewChild('surfaceColorInput')
  private surfaceColorInputRef!: ElementRef;

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    this.fixCanvasSize();
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.render(this.scene, this.camera);
  }

  // Stage properties
  //@Input() public fieldOfView: number = 45;
  @Input() public fieldOfView: number = 1;
  @Input() public nearClippingPlane: number = 1;
  @Input() public farClippingPlane: number = 10000;

  // Helper properties
  private camera!: THREE.PerspectiveCamera;
  private geometry!: ParametricGeometry; 
  private renderer!: THREE.WebGLRenderer;
  private surfaceMaterial!: THREE.MeshStandardMaterial;
  private wireframe!: THREE.WireframeGeometry;
  private wire: THREE.LineSegments | undefined;
  private wireframeMaterial!: THREE.LineBasicMaterial;
  private scene!: THREE.Scene;
  private mesh: THREE.Mesh | undefined;
  private light!: THREE.PointLight;
  private controls!: OrbitControls;
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  // Visual parameters
  thetaMax: number = 2;
  divisions: number = 50;
  surfaceColor: string = "#F0F0F0";
  wireframeColor: string = "#000000";
  wireframeVisible: boolean = true;
  menuVisible: boolean = false;

  // Surface parameters
  parameters: SurfaceParameters = SurfaceParameters.Shell1();

  private surfaceFunction() {
    let params : SurfaceParameters = this.parameters;
    const thetaRange = this.thetaMax * Math.PI;
    const sRange = 4 * Math.PI;
    const alpha = toRadians(params.alpha);
    const beta  = toRadians(params.beta);
    const mu    = toRadians(params.mu);
    const omega = toRadians(params.omega);
    const phi   = toRadians(params.phi);
    return function(theta0: number, s0: number, target: THREE.Vector3) {
      const theta = theta0 * thetaRange;
      const s = s0 * sRange;
      const re = 1 / Math.sqrt(Math.pow(Math.cos(s) / params.a, 2) + Math.pow(Math.sin(s) / params.b, 2));
      const ecot = Math.exp(theta / Math.tan(alpha));
      const x = params.d * (
        params.A * Math.sin(beta) * Math.cos(theta) + 
        re * Math.cos(s + phi) * Math.cos(theta + omega) -
        re * Math.sin(mu) * Math.sin(s + phi) * Math.sin(theta + omega)
      ) * ecot;
      const y = (
        params.A * Math.sin(beta) * Math.sin(theta) +
        re * Math.cos(s + phi) * Math.sin(theta + omega) +
        re * Math.sin(mu) * Math.sin(s + phi) * Math.cos(theta + omega)
      ) * ecot;
      const z = (
        -params.A * Math.cos(beta) +
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

  private createGeometry(): void {
    const divisions = this.divisions;
    let meshFunction = this.surfaceFunction();
    this.geometry = new ParametricGeometry(meshFunction, divisions, divisions);
    this.geometry.center();
    const xmin = this.geometry.boundingBox!.min.x;
    const xmax = this.geometry.boundingBox!.max.x;
    const xrange = xmax - xmin;
    const xscale = 1.0 / xrange;
    const ymin = this.geometry.boundingBox!.min.y;
    const ymax = this.geometry.boundingBox!.max.y;
    const yrange = ymax - ymin;
    const yscale = 1.0 / yrange;
    const zmin = this.geometry.boundingBox!.min.z;
    const zmax = this.geometry.boundingBox!.max.z;
    const zrange = zmax - zmin;
    const zscale = 1.0 / zrange;
    const scale = Math.min(xscale, yscale, zscale);
    this.geometry.scale(scale, scale, scale);
  }

  private createSurfaceMaterial(): void {
    if (this.surfaceMaterial != undefined) {
      this.surfaceMaterial.dispose();
    }
    this.surfaceMaterial = new THREE.MeshStandardMaterial(
      { color: this.surfaceColor, side: THREE.DoubleSide }
    );
  }

  private createWireframeMaterial(): void {
    if (this.wireframeMaterial != undefined) {
      this.wireframeMaterial.dispose();
    }
    this.wireframeMaterial = new THREE.LineBasicMaterial(
      { color: this.wireframeColor }
    )
  }

  private createMaterials(): void {
    this.createSurfaceMaterial();
    this.createWireframeMaterial();
  }

  private createMesh(): void {
    if (this.mesh != undefined && this.mesh.parent == this.scene) {
      this.scene.remove(this.mesh);
      this.mesh = undefined;
    }
    this.mesh = new THREE.Mesh(this.geometry, this.surfaceMaterial);
    this.scene.add(this.mesh);
  }

  private createWireframe(): void {
    if (this.wire != undefined && this.wire.parent == this.scene) {
      this.scene.remove(this.wire);
      this.wire = undefined;
    }
    if (this.wireframe != undefined) {
      this.wireframe.dispose();
    }
    this.wireframe = new THREE.WireframeGeometry(this.geometry)
    this.wire = new THREE.LineSegments(this.wireframe, this.wireframeMaterial);
    this.showWireframe();
  }

  private createGraphElements(): void {
    this.createGeometry();
    this.createMaterials();
    this.createMesh();
    this.createWireframe();
  }

  private getAspectRatio(): number {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  // Rendering loop
  private startRenderingLoop() {
    let component: SurfaceComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.controls.update();
      component.renderer.render(component.scene, component.camera);
    }());
  }

  constructor() {
    // do nothing
  }

  private fixCanvasSize(): void {
    const width  = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    // If it's resolution does not match change it
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  ngAfterViewInit(): void {
    this.fixCanvasSize();
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#0F0F0F");
    let aspectRatio = this.getAspectRatio();
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    // Light
    this.light = new THREE.PointLight("#FFFFFF");
    this.camera.add(this.light);
    this.scene.add(this.camera);
    // Render
    this.renderer = new THREE.WebGLRenderer(
      { canvas: this.canvas, preserveDrawingBuffer: true }
    )
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.startRenderingLoop();
    this.createGraph();
    this.setCamera();
  }

  private disposeGraphElements(): void {
    if (this.mesh != undefined && this.mesh.parent == this.scene) {
      this.scene.remove(this.mesh);
      this.mesh = undefined;
    }
    if (this.surfaceMaterial != undefined) {
      this.surfaceMaterial.dispose();
    }
    if (this.wire != undefined && this.wire.parent == this.scene) {
      this.scene.remove(this.wire);
      this.wire = undefined;
    }
    if (this.wireframe != undefined) {
      this.wireframe.dispose();
    }
    if (this.geometry != undefined) {
      this.geometry.dispose();
    }
  }

  public wireframeCheckboxChanged(event: Event): void {
    this.showWireframe();
  }

  private showWireframe(): void {
    if (this.wireframeVisible) {
      if (this.wire != undefined && this.wire.parent == undefined) {
        this.scene.add(this.wire);
      }
    }
    else {
      if (this.wire != undefined && this.wire.parent == this.scene) {
        this.scene.remove(this.wire);
      }
    }
  }

  private setCamera(): void {
    this.camera.position.set(50, 50, 0);
    this.controls.update();
  }

  createGraph(): void {
    this.disposeGraphElements();
    this.createGraphElements();
  }

  clickExportImage(event: Event): void {
    const date  = new Date();
    const year  = date.getFullYear();
    const month = date.getMonth() + 1;
    const day   = date.getDate();
    const stamp = Math.round(date.getTime() / 1000);
    const name = `shell-${year}${month}${day}_${stamp}`;
    this.savePNG(this.canvas.toDataURL("image/png", 1.0), name);
  }

  private savePNG(path: string, name: string) {
    const link = document.createElement('a');
    link.setAttribute("download", name + '.png');
    link.setAttribute("href", path.replace("image/png", "image/octet-stream"));
    link.click();
  }

  randomShellEvent(event: Event): void {
    this.parameters = SurfaceParameters.randomParameters();
    this.createGraph();
  }

  public surfaceColorChanged(event: Event): void {
    this.createSurfaceMaterial();
    this.createMesh();
  }

  public wireframeColorChanged(event: Event): void {
    this.createWireframeMaterial();
    this.createWireframe();
  }

  menuButtonClick(event: Event): void {
    this.menuVisible = !this.menuVisible;
  }

  parameterUpdateEvent(event: Event): void {
    this.createGraph();
  }

  shellASelectEvent(event: Event): void {
    this.parameters = SurfaceParameters.Shell1();
    this.createGraph();
  }

  shellBSelectEvent(event: Event): void {
    this.parameters = SurfaceParameters.Shell2();
    this.createGraph();
  }

  shellCSelectEvent(event: Event): void {
    this.parameters = SurfaceParameters.Shell3();
    this.createGraph();
  }

  shellDSelectEvent(event: Event): void {
    this.parameters = SurfaceParameters.Shell4();
    this.createGraph();
  }

}
