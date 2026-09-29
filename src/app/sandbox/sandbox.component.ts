import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ShellParameters } from '../shell-parameters';
import { ShellViewer } from '../shell-viewer';
import { AppStrings } from '../app-strings';
import { ParameterHelp } from '../parameter-help';

@Component({
  selector: 'app-surface',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})



export class SandboxComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  @ViewChild('menu')
  private menuRef!: ElementRef;

  @ViewChild('visualizationMenu')
  private visualizationMenuRef!: ElementRef;

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

  // Pop-up state (#31), bound to the <app-modal>'s [open] and reset by its
  // (closed): Esc, a click on the backdrop or the ✕.
  introOpen = false;

  // Parameter help (#6): the ⓘ whose callout is open, if any. Its ⓘ toggles
  // it; Esc, a click on the canvas or closing its panel clears it. Moving a
  // slider leaves it open.
  help = new ParameterHelp();

  // Visual parameters
  menuVisible: boolean = false;
  visualizationMenuVisible: boolean = false;

  ShellParameters = ShellParameters;
  AppStrings = AppStrings;

  // Surface parameters
  parameters: ShellParameters = ShellParameters.Shell1();
  helper: ShellViewer   = new ShellViewer();

  constructor(private router: Router) {
  }

  // Opened before the first render, so the welcome shows on load without a
  // second change detection pass.
  ngOnInit(): void {
    this.showIntroWindow();
  }

  ngAfterViewInit(): void {
    this.helper.init(this.fieldOfView, this.nearClippingPlane, this.farClippingPlane, this.canvas);
    this.helper.createGraph(this.parameters);
  }

  // Stop the render loop when leaving the initial screen (#21).
  ngOnDestroy(): void {
    this.helper.dispose();
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
    if (this.visualizationMenuVisible) {
      this.hideVisualizationMenu();
    }
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
    if (this.help.key && this.help.key !== 'qual') {
      this.help.close();
    }
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
    if (this.help.key === 'qual') {
      this.help.close();
    }
  }

  gameButtonClick(event: Event) {
    this.navigateToGame();
  }

  private navigateToGame() {
    this.router.navigate(['game']);
  }

  parameterHelpAButtonClick(event: Event) {
    this.help.toggle('A');
  }

  parameterHelpAlphaButtonClick(event: Event) {
    this.help.toggle('alpha');
  }

  parameterHelpBetaButtonClick(event: Event) {
    this.help.toggle('beta');
  }

  parameterHelpA1ButtonClick(event: Event) {
    this.help.toggle('a');
  }

  parameterHelpBButtonClick(event: Event) {
    this.help.toggle('b');
  }

  parameterHelpThetaButtonClick(event: Event) {
    this.help.toggle('theta');
  }

  parameterHelpQualButtonClick(event: Event) {
    this.help.toggle('qual');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.help.close();
  }

  introButtonClick(event: Event) {
    this.showIntroWindow();
  }

  private showIntroWindow() {
    this.introOpen = true;
  }

}
