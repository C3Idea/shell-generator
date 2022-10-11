import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ShellParameters } from '../shell-parameters';
import { ShellViewerHelper } from '../shell-viewer-helper';

@Component({
  selector: 'app-surface',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})



export class GameComponent implements AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  @ViewChild('menu')
  private menuRef!: ElementRef;

  @ViewChild('targetCanvas')
  private targetCanvasRef!: ElementRef;

  @ViewChild('resultBox')
  private resultBoxRef!: ElementRef;

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.helper.resize(width, height);
    this.targetHelper.resize(width, height);
  }

  // Stage properties
  @Input() public fieldOfView: number = 1;
  @Input() public nearClippingPlane: number = 1;
  @Input() public farClippingPlane: number = 10000;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  private get menu(): HTMLDivElement {
    return this.menuRef.nativeElement;
  }
  private get targetCanvas(): HTMLCanvasElement {
    return this.targetCanvasRef.nativeElement;
  }
  private get resultBox(): HTMLDivElement {
    return this.resultBoxRef.nativeElement;
  }

  ShellParametersRef = ShellParameters;

  // Visual parameters
  menuVisible: boolean = false;
  targetVisible: boolean = false;
  switchText: string = "user";

  // Surface parameters
  parameters: ShellParameters = new ShellParameters();
  helper: ShellViewerHelper   = new ShellViewerHelper();
  targetParameters: ShellParameters = ShellParameters.randomParameters();
  targetHelper: ShellViewerHelper = new ShellViewerHelper();

  ngAfterViewInit(): void {
    this.setShellVisibility();
    this.parameters.mu  = this.targetParameters.mu;
    this.parameters.phi = this.targetParameters.phi;
    this.parameters.omega = this.targetParameters.omega;
    this.parameters.b     = this.targetParameters.b; 
    this.parameters.theta = this.targetParameters.theta;
    this.helper.init(this.fieldOfView, this.nearClippingPlane, this.farClippingPlane, this.canvas);
    this.helper.createGraph(this.parameters);
    this.targetHelper.init(this.fieldOfView, this.nearClippingPlane, this.farClippingPlane, this.targetCanvas);
    this.targetHelper.createGraph(this.targetParameters);
    this.checkGameIsOver();
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


  menuButtonClick(event: Event): void {
    if (this.menuVisible) {
      this.hideMenu();
    }
    else {
      this.showMenu();
    }
  }

  parameterUpdateEvent(event: Event): void {
    this.helper.createGraph(this.parameters)
    this.checkGameIsOver();
  }

  canvasMouseDownEvent(event: MouseEvent): void {
    if (this.menuVisible) {
      this.hideMenu();
    }
  }

  setMenuVisibility(): void {
    if (this.menuVisible) {
      this.menu.style.display = 'none';
    }
    else {
      this.menu.style.display = 'block';
    }
  }

  private hideMenu() {
    this.menu.style.display = 'none';
    this.menuVisible = false;
  }

  private showMenu() {
    this.menu.style.display = 'block';
    this.menuVisible = true;
  }

  private setShellVisibility() {
    if (this.targetVisible) {
      this.switchText = "target";
      this.canvas.style.opacity = "1";
      this.canvas.style.zIndex  = "-1";
      this.targetCanvas.style.opacity = "0.85";
      this.targetCanvas.style.zIndex  = "0";
    }
    else {
      this.switchText = "user";
      this.canvas.style.opacity = "0.85";
      this.canvas.style.zIndex  = "0";
      this.targetCanvas.style.opacity = "1";
      this.targetCanvas.style.zIndex  = "-1";
    }
  }

  switchButtonClick(event: Event) {
    this.setShellVisibility(); 
  }

  checkGameIsOver(): boolean {
    const result = this.checkParametersAreSimilar();
    this.setResultBoxColor(result);
    return result;
  }

  setResultBoxColor(result: boolean) {
    if (result) {
      this.resultBox.style.backgroundColor = "#00FF00";
    }
    else {
      this.resultBox.style.backgroundColor = "#FF0000";
    }
  }

  checkParametersAreSimilar(): boolean {
    let temp;
    temp = Math.abs(this.parameters.A - this.targetParameters.A);
    const threshold = 3;
    if (temp > threshold) {
      return false;
    }
    temp = Math.abs(this.parameters.alpha - this.targetParameters.alpha);
    if (temp > threshold) {
      return false;
    }
    temp = Math.abs(this.parameters.beta - this.targetParameters.beta);
    if (temp > threshold) {
      return false;
    }
    temp = Math.abs(this.parameters.a - this.targetParameters.a);
    if (temp > threshold) {
      return false;
    }
    temp = Math.abs(this.parameters.b - this.targetParameters.b);
    if (temp > threshold) {
      return false;
    }
    temp = Math.abs(this.parameters.theta - this.targetParameters.theta);
    if (temp > 0.25) {
      return false;
    }
    return true;
  }

}
