import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';
import { SurfaceParameters } from './surface.parameters';

declare function toRadians(x: number): number;

@Component({
  selector: 'app-surface',
  templateUrl: './surface.component.html',
  styleUrls: ['./surface.component.css']
})

export class SurfaceComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  // Stage properties
  //@Input() public fieldOfView: number = 45;
  @Input() public fieldOfView: number = 1;
  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 10000;

  // Helper properties
  private camera!: THREE.PerspectiveCamera;
  private geometry!: ParametricGeometry; 
  private renderer!: THREE.WebGLRenderer;
  private material!: THREE.MeshStandardMaterial;
  private wireframe!: THREE.WireframeGeometry;
  private wire: THREE.LineSegments | undefined;
  private scene!: THREE.Scene;
  private mesh: THREE.Mesh | undefined;
  private light!: THREE.PointLight;
  private controls!: OrbitControls;
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  // Surface parameters
  public parameters = new SurfaceParameters();

  private surfaceFunction() {
    let params : SurfaceParameters = this.parameters;
    const thetaRange = params.thetaMax * Math.PI;
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
    const divisions = this.parameters.divisions;
    let meshFunction = this.surfaceFunction();
    this.geometry = new ParametricGeometry(meshFunction, divisions, divisions);
    this.geometry.center();
    const zmin = this.geometry.boundingBox!.min.z;
    const zmax = this.geometry.boundingBox!.max.z;
    const zrange = zmax - zmin;
    const scale = 1.0 / zrange;
    this.geometry.scale(scale, scale, scale);
  }

  private createMaterial(): void {
    if (this.material != undefined) {
      this.material.dispose();
    }
    this.material = new THREE.MeshStandardMaterial(
      { color: this.parameters.color, side: THREE.DoubleSide }
    );
  }

  private createMesh(): void {
    if (this.mesh != undefined && this.mesh.parent == this.scene) {
      this.scene.remove(this.mesh);
      this.mesh = undefined;
    }
    this.mesh = new THREE.Mesh(this.geometry, this.material);
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
    this.wire = new THREE.LineSegments(this.wireframe);
  }

  private createGraph(): void {
    this.createGeometry();
    this.createMaterial();
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
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0F0F0F);
    let aspectRatio = this.getAspectRatio();
    // Camera
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    // Light
    this.light = new THREE.PointLight(0xFFFFFF);
    this.camera.add(this.light);
    this.scene.add(this.camera);
    // Render
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas })
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.startRenderingLoop();
  }

  private disposeGraphElements(): void {
    if (this.mesh != undefined && this.mesh.parent == this.scene) {
      this.scene.remove(this.mesh);
      this.mesh = undefined;
    }
    if (this.material != undefined) {
      this.material.dispose();
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
    if (this.parameters.showWireframe) {
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
    const xmax = this.geometry.boundingBox!.max.x;
    const ymax = this.geometry.boundingBox!.max.y;
    const zmax = this.geometry.boundingBox!.max.z;
    this.camera.position.set(50, 50, 50);
    this.controls.update();
  }

  public clickGenerateGraph(event: Event): void {
    this.disposeGraphElements();
    this.createGraph();
    this.setCamera();
  }

  public shellSelectChange(event: Event): void {
    switch ((event.target as HTMLSelectElement).selectedIndex) {
      case 0:
        this.parameters = new SurfaceParameters();
        break;
      case 1:
        this.parameters = SurfaceParameters.Shell1();
        break;
      case 2:
        this.parameters = SurfaceParameters.Shell2();
        break;
      case 3:
        this.parameters = SurfaceParameters.Shell3();
        break;
      case 4:
        this.parameters = SurfaceParameters.Shell4();
        break;
    }
  }

  public colorPickerChanged(event: Event): void {
    this.createMaterial();
    this.createMesh();
  }
}
