import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ShellParameters } from '../shell-parameters';
import { ShellViewer } from '../shell-viewer';
import { AppStrings } from '../app-strings';
import { HelpKey, ParameterHelp } from '../parameter-help';
import { ControlGuide, SANDBOX_GUIDE } from '../control-guide';

// How far a press may move and still count as a tap on the 3D view (#5).
const TAP_SLOP = 10;

// How much of the shell's box #shell-region covers, around its middle (#5).
const SHELL_REGION_SCALE = 0.7;

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

  // Parameter help (#6): the ⓘ whose callout is open, if any. Its ⓘ toggles
  // it; Esc, a click on the canvas or closing its panel clears it. Moving a
  // slider leaves it open.
  help = new ParameterHelp();

  // The guide (#5): the "?" button shows a callout beside every control.
  guide = new ControlGuide(SANDBOX_GUIDE);

  // Pointers down on the 3D view, where each went down; and whether two
  // were down at once (a pinch).
  private presses = new Map<number, { x: number; y: number }>();
  private pinching = false;

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
  // (zoom) doesn't, so the user can try what its bubble says. A tap is one
  // pointer, the primary button, released within TAP_SLOP px of where it
  // went down; the right and middle buttons pan. A primary pointer going down
  // starts a new gesture, so a press whose pointerup was lost can't leave a
  // stale "pinch" behind.
  canvasPointerDown(event: PointerEvent): void {
    if (event.isPrimary) {
      this.presses.clear();
      this.pinching = false;
    }
    this.presses.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.presses.size > 1) {
      this.pinching = true;
    }
  }

  canvasPointerUp(event: PointerEvent): void {
    const start = this.presses.get(event.pointerId);
    const tap = start !== undefined && !this.pinching && event.button === 0
      && Math.hypot(event.clientX - start.x, event.clientY - start.y) < TAP_SLOP;
    this.canvasPointerCancel(event);
    if (tap) {
      this.guide.close();
    }
    else {
      this.followShell();
    }
  }

  // Moves #shell-region over the drawn shell, shrunk towards its middle so
  // the 3D view's arrow lands on the shell rather than a corner of its box,
  // and (unless `replace` is false) has the guide placed again (#5). Only
  // while the guide is on.
  private followShell(replace = true): void {
    const box = this.guide.on ? this.helper.shellScreenBox() : null;
    if (!box || !this.shellRegionRef) {
      return;
    }
    const style = this.shellRegionRef.nativeElement.style;
    style.left = `${box.left + box.width * (1 - SHELL_REGION_SCALE) / 2}px`;
    style.top = `${box.top + box.height * (1 - SHELL_REGION_SCALE) / 2}px`;
    style.width = `${box.width * SHELL_REGION_SCALE}px`;
    style.height = `${box.height * SHELL_REGION_SCALE}px`;
    if (replace) {
      this.guide.refresh();
    }
  }

  canvasPointerCancel(event: PointerEvent): void {
    this.presses.delete(event.pointerId);
    if (this.presses.size === 0) {
      this.pinching = false;
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

  introButtonClick(event: Event) {
    this.showIntroWindow();
  }

  private showIntroWindow() {
    this.guide.close();
    this.introOpen = true;
  }

}
