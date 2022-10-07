import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ShellParameters } from '../shell-parameters';
import { ShellViewerHelper } from '../shell-viewer-helper';

@Component({
  selector: 'app-surface',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})



export class SandboxComponent implements AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  @ViewChild('menu')
  private menuRef!: ElementRef;

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.helper.resize(width, height);
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


  // Visual parameters
  menuVisible: boolean = false;

  // Surface parameters
  parameters: ShellParameters = ShellParameters.Shell1();
  helper: ShellViewerHelper   = new ShellViewerHelper();


  ngAfterViewInit(): void {
    this.helper.init(this.fieldOfView, this.nearClippingPlane, this.farClippingPlane, this.canvas);
    this.helper.createGraph(this.parameters);
  }

  public wireframeCheckboxChanged(event: Event): void {
    this.helper.setWireframeVisibility();
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
    this.parameters = ShellParameters.randomParameters();
    this.helper.createGraph(this.parameters);
  }

  surfaceColorChanged(event: Event): void {
    this.helper.changeSurfaceColor();
  }

  wireframeColorChanged(event: Event): void {
    this.helper.changeWireframeColor();
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
  }

  shellASelectEvent(event: Event): void {
    this.parameters = ShellParameters.Shell1();
    this.helper.createGraph(this.parameters);
  }

  shellBSelectEvent(event: Event): void {
    this.parameters = ShellParameters.Shell2();
    this.helper.createGraph(this.parameters);
  }

  shellCSelectEvent(event: Event): void {
    this.parameters = ShellParameters.Shell3();
    this.helper.createGraph(this.parameters);
  }

  canvasClickEvent(event: Event): void {
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

}
