import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ShellParameters } from '../shell-parameters';
import { ShellViewer } from '../shell-viewer';

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

  @ViewChild('visualizationMenu')
  private visualizationMenuRef!: ElementRef;

  @ViewChild('modalHelpWindow')
  private modalHelpWindowRef!: ElementRef;

  @ViewChild('modalIntroWindow')
  private modalIntroWindowRef!: ElementRef;

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.helper.resize(width, height);
  }

  // Stage properties
  private fieldOfView: number = 1;
  private nearClippingPlane: number = 1;
  private farClippingPlane: number = 10000;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  private get menu(): HTMLFormElement {
    return this.menuRef.nativeElement;
  }
  private get visualizationMenu(): HTMLFormElement {
    return this.visualizationMenuRef.nativeElement;
  }
  private get modalHelpWindow(): HTMLDivElement {
    return this.modalHelpWindowRef.nativeElement;
  }
  private get modalIntroWindow(): HTMLDivElement {
    return this.modalIntroWindowRef.nativeElement
  }

  helpContent: string = "";
  introContent: string = "WELCOME";

  // Visual parameters
  menuVisible: boolean = false;
  visualizationMenuVisible: boolean = false;

  ShellParametersRef = ShellParameters;

  // Surface parameters
  parameters: ShellParameters = ShellParameters.Shell1();
  helper: ShellViewer   = new ShellViewer();

  constructor(private router: Router) {
  }

  ngAfterViewInit(): void {
    this.helper.init(this.fieldOfView, this.nearClippingPlane, this.farClippingPlane, this.canvas);
    this.helper.createGraph(this.parameters);
    this.showIntroWindow();
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
    this.helper.updateSurfaceColor();
  }

  wireframeColorChanged(event: Event): void {
    this.helper.updateWireframeColor();
  }

  menuButtonClick(event: Event): void {
    if (this.menuVisible) {
      this.hideMenu();
    }
    else {
      this.showMenu();
    }
  }

  visualizationMenuButtonClick(event: Event): void {
    if (this.menuVisible) {
      this.hideMenu();
    }
    this.showVisualizationMenu();
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
    if (this.visualizationMenuVisible) {
      this.hideVisualizationMenu();
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

  private showVisualizationMenu() {
    this.visualizationMenu.style.display = 'block';
    this.visualizationMenuVisible = true;
  }

  private hideVisualizationMenu() {
    this.visualizationMenu.style.display = 'none';
    this.visualizationMenuVisible = false;
  }

  gameButtonClick(event: Event) {
    this.navigateToGame();
  }

  private navigateToGame() {
    this.router.navigate(['game']);
  }

  modalMouseDown(event: Event) {
    if (event.target == this.modalIntroWindow) {
      this.closeModalIntroWindow();
    }
    else if (event.target == this.modalHelpWindow) {
      this.closeModalHelpWindow();
    }
  }

  private closeModalHelpWindow() {
    this.modalHelpWindow.style.display = 'none';
  }

  private closeModalIntroWindow() {
    this.modalIntroWindow.style.display = 'none';
  }

  parameterHelpAButtonClick(event: Event) {
    this.helpContent = "Parameter A help message.";
    this.modalHelpWindow.style.display = 'block';
  }

  parameterHelpAlphaButtonClick(event: Event) {
    this.helpContent = "Parameter alpha help message.";
    this.modalHelpWindow.style.display = 'block';
  }

  parameterHelpBetaButtonClick(event: Event) {
    this.helpContent = "Parameter beta help message.";
    this.modalHelpWindow.style.display = 'block';
  }

  parameterHelpA1ButtonClick(event: Event) {
    this.helpContent = "Parameter a (lowercase) help message.";
    this.modalHelpWindow.style.display = 'block';
  }

  parameterHelpBButtonClick(event: Event) {
    this.helpContent = "Parameter b help message.";
    this.modalHelpWindow.style.display = 'block';
  }

  parameterHelpThetaButtonClick(event: Event) {
    this.helpContent = "Parameter theta help message.";
    this.modalHelpWindow.style.display = 'block';
  }

  parameterHelpQualButtonClick(event: Event) {
    this.helpContent = "Parameter quality help message.";
    this.modalHelpWindow.style.display = 'block';
  }

  introButtonClick(event: Event) {
    this.showIntroWindow();
  }

  private showIntroWindow() {
    this.modalIntroWindow.style.display = 'block';
  }

}
