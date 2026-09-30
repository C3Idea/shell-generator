import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ShellParameters } from '../shell-parameters';
import { ShellViewer } from '../shell-viewer';
import { AppStrings } from '../app-strings';
import { HelpKey, ParameterHelp } from '../parameter-help';
import { ControlGuide, SANDBOX_GUIDE } from '../control-guide';
import { CanvasTap, followShell } from '../shell-region';

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

  @ViewChild('shellRegion')
  private shellRegionRef!: ElementRef<HTMLElement>;

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.helper.resize(width, height);
    // Only move the shell region: the callout's own resize listener, which
    // runs after this one, lays the guide out again (once).
    this.followShell(false);
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
  // The welcome pop-up's full equation (#3): collapsed until asked for.
  fullEquationOpen = false;

  // Parameter help (#6): the ⓘ whose callout is open, if any. Its ⓘ toggles
  // it; Esc, a click on the canvas or closing its panel clears it. Moving a
  // slider leaves it open.
  help = new ParameterHelp();

  // The guide (#5): the "?" button shows a callout beside every control.
  guide = new ControlGuide(SANDBOX_GUIDE);

  // Tells a tap on the 3D view from a drag or a pinch (#5).
  private tap = new CanvasTap();

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

  // A tap on the 3D view ends the guide (#5); a drag (rotate) or a pinch
  // (zoom) doesn't (CanvasTap, shared with the game).
  canvasPointerDown(event: PointerEvent): void {
    this.tap.down(event);
  }

  canvasPointerUp(event: PointerEvent): void {
    if (this.tap.up(event)) {
      this.guide.close();
    }
    else {
      this.followShell();
    }
  }

  canvasPointerCancel(event: PointerEvent): void {
    this.tap.cancel(event);
  }

  // Keeps #shell-region over the drawn shell and (unless `replace` is false)
  // has the guide placed again (#5). Only while the guide is on.
  private followShell(replace = true): void {
    if (!this.guide.on || !this.shellRegionRef) {
      return;
    }
    if (followShell(this.shellRegionRef.nativeElement, this.helper.shellScreenBox()) && replace) {
      this.guide.refresh();
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

  // Opening a panel ends the guide (#5): one kind of help at a time.
  private showMenu() {
    this.menu.style.display = 'block';
    this.menuVisible = true;
    this.guide.close();
  }

  private showVisualizationMenu() {
    this.visualizationMenu.style.display = 'block';
    this.visualizationMenuVisible = true;
    this.guide.close();
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
    this.toggleHelp('A');
  }

  parameterHelpAlphaButtonClick(event: Event) {
    this.toggleHelp('alpha');
  }

  parameterHelpBetaButtonClick(event: Event) {
    this.toggleHelp('beta');
  }

  parameterHelpA1ButtonClick(event: Event) {
    this.toggleHelp('a');
  }

  parameterHelpBButtonClick(event: Event) {
    this.toggleHelp('b');
  }

  parameterHelpThetaButtonClick(event: Event) {
    this.toggleHelp('theta');
  }

  parameterHelpQualButtonClick(event: Event) {
    this.toggleHelp('qual');
  }

  // A parameter ⓘ ends the guide (#5).
  private toggleHelp(key: HelpKey) {
    this.guide.close();
    this.help.toggle(key);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.help.close();
    this.guide.close();
  }

  // Turning the guide on closes the panels and any ⓘ help first.
  helpButtonClick(event: Event) {
    if (!this.guide.on) {
      this.help.close();
      if (this.menuVisible) {
        this.hideMenu();
      }
      if (this.visualizationMenuVisible) {
        this.hideVisualizationMenu();
      }
    }
    this.guide.toggle();
    this.followShell();
  }

  // "Ver / Ocultar ecuación completa" in the welcome pop-up (#3).
  fullEquationButtonClick() {
    this.fullEquationOpen = !this.fullEquationOpen;
  }

  // "Jugar" in the welcome pop-up (#3): straight into the game.
  playButtonClick() {
    this.closeIntro();
    this.navigateToGame();
  }

  // Every way out of the welcome pop-up (✕, Esc, backdrop, "Jugar") ends here,
  // so it never stays expanded behind the scenes (#3).
  closeIntro() {
    this.introOpen = false;
    this.fullEquationOpen = false;
  }

  introButtonClick(event: Event) {
    this.showIntroWindow();
  }

  private showIntroWindow() {
    this.guide.close();
    this.fullEquationOpen = false;
    this.introOpen = true;
  }

}
