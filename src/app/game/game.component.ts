import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ShellParameters } from '../shell-parameters';
import { ShellViewer } from '../shell-viewer';
import { AppStrings } from '../app-strings';

@Component({
  selector: 'app-surface',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})


export class GameComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  private canvasRef!: ElementRef;

  @ViewChild('menu')
  private menuRef!: ElementRef;

  @ViewChild('targetCanvas')
  private targetCanvasRef!: ElementRef;

  @ViewChild('modalWindow')
  private modalWindowRef!: ElementRef;

  @ViewChild('modalHelpWindow')
  private modalHelpWindowRef!: ElementRef;

  @ViewChild('modalHowToWindow')
  private modalHowToWindowRef!: ElementRef;

  @ViewChild('distanceRange')
  private distanceRangeRef!: ElementRef;

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.viewer.resize(width, height);
    this.targetViewer.resize(width, height);
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
  private get menu(): HTMLFormElement {
    return this.menuRef.nativeElement;
  }
  private get targetCanvas(): HTMLCanvasElement {
    return this.targetCanvasRef.nativeElement;
  }
  private get modalWindow(): HTMLDivElement {
    return this.modalWindowRef.nativeElement;
  }
  private get modalHelpWindow(): HTMLDivElement {
    return this.modalHelpWindowRef.nativeElement;
  }
  private get modalHowToWindow(): HTMLDivElement {
    return this.modalHowToWindowRef.nativeElement;
  }
  private get distanceRange(): HTMLInputElement {
    return this.distanceRangeRef.nativeElement;
  }

    // Stage properties
  private fieldOfView: number = 1;
  private nearClippingPlane: number = 1;
  private farClippingPlane: number = 10000;

  ShellParameters = ShellParameters;
  AppStrings = AppStrings;

  // Visual parameters
  menuVisible: boolean = false;
  targetVisible: boolean = false;
  switchText: string = "user";

  // Surface parameters
  parameters: ShellParameters;
  viewer!: ShellViewer;
  targetParameters: ShellParameters;
  targetViewer!: ShellViewer;

  private userShellColor   = "#F0F0F0";
  private targetShellColor = "#D2B478";

  helpTitle:   string = "";
  helpContent: string = "";

  distance: number;

  constructor(private router: Router) {
    this.parameters = new ShellParameters();
    this.targetParameters = ShellParameters.randomParameters();
    this.setupGame();
    this.distance = this.parameters.distance(this.targetParameters);
  }

  ngOnInit(): void {
  }
  
  ngAfterViewInit(): void {
    this.setupShellViewers();
    this.setShellVisibility();
    this.createShellGraphs();
    this.showHowToWindow();
    this.checkGameIsOver();
  }

  private setupGame() {
    // We fix some parameters
    this.parameters.mu  = this.targetParameters.mu;
    this.parameters.phi = this.targetParameters.phi;
    this.parameters.omega = this.targetParameters.omega;
    this.parameters.b     = this.targetParameters.b; 
    this.parameters.theta = this.targetParameters.theta;
  }

  private createShellGraphs() {
    this.viewer.createGraph(this.parameters);
    this.targetViewer.createGraph(this.targetParameters);
  }

  private setupShellViewers() {
    this.viewer = new ShellViewer();
    this.viewer.init(this.fieldOfView, this.nearClippingPlane, this.farClippingPlane, this.canvas);
    this.viewer.surfaceColor = this.userShellColor;
    this.targetViewer = new ShellViewer();
    this.targetViewer.init(this.fieldOfView, this.nearClippingPlane, this.farClippingPlane, this.targetCanvas);
    this.targetViewer.surfaceColor = this.targetShellColor;
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
    this.viewer.createGraph(this.parameters)
    this.distance = this.parameters.distance(this.targetParameters);
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
      this.targetCanvas.style.opacity = "0.9";
      this.targetCanvas.style.zIndex  = "0";
    }
    else {
      this.switchText = "user";
      this.canvas.style.opacity = "0.9";
      this.canvas.style.zIndex  = "0";
      this.targetCanvas.style.opacity = "1";
      this.targetCanvas.style.zIndex  = "-1";
    }
  }

  switchButtonClick(event: Event) {
    this.setShellVisibility(); 
  }

  checkGameIsOver(): void {
    const result = this.checkParametersAreSimilar();
    if (result) {
      this.modalWindow.style.display = 'block';
    }
  }

  checkParametersAreSimilar(): boolean {
    let temp;
    temp = Math.abs(this.parameters.A - this.targetParameters.A);
    const AThreshold = 1.5;
    if (temp > AThreshold) {
      return false;
    }
    temp = Math.abs(this.parameters.alpha - this.targetParameters.alpha);
    const alphaThreshold =1.5;
    if (temp > alphaThreshold) {
      return false;
    }
    temp = Math.abs(this.parameters.beta - this.targetParameters.beta);
    const betaThreshold = 8;
    if (temp > betaThreshold) {
      return false;
    }
    temp = Math.abs(this.parameters.a - this.targetParameters.a);
    const aThreshold = 1;
    if (temp > aThreshold) {
      return false;
    }
    temp = Math.abs(this.parameters.b - this.targetParameters.b);
    const bThreshold = 3;
    if (temp > bThreshold) {
      return false;
    }
    temp = Math.abs(this.parameters.theta - this.targetParameters.theta);
    if (temp > 0.25) {
      return false;
    }
    return true;
  }

  private closeModalWindow() {
    this.modalWindow.style.display = 'none';
  }

  private closeModalHelpWindow() {
    this.modalHelpWindow.style.display = 'none';
  }

  private closeModalHowToWindow() {
    this.modalHowToWindow.style.display = 'none';
  }

  private newGame() {
    this.parameters       = new ShellParameters();
    this.targetParameters = ShellParameters.randomParameters();
    this.setupGame();
    this.distance         = this.parameters.distance(this.targetParameters);
    this.setupShellViewers();
    this.setShellVisibility();
    this.createShellGraphs();
    this.checkGameIsOver();
  }

  newGameButtonClick(event: Event) {
    this.closeModalWindow();
    this.newGame();
  }

  private navigateToSandbox() {
    this.router.navigate(['']);
  }

  sandboxButtonClick(event: Event) {
    this.navigateToSandbox();
  }

  modalMouseDown(event: Event) {
    if (event.target == this.modalWindow) {
      this.closeModalWindow();
    }
    else if (event.target == this.modalHelpWindow) {
      this.closeModalHelpWindow();
    }
    else if (event.target == this.modalHowToWindow) {
      this.closeModalHowToWindow();
    }
  }

  parameterHelpAButtonClick(event: Event) {
    this.helpTitle   = AppStrings.LABEL_PARAM_A_HELP_TITLE;
    this.helpContent = AppStrings.LABEL_PARAM_A_HELP_CONTENT;
    this.modalHelpWindow.style.display = 'block';
  }

  parameterHelpAlphaButtonClick(event: Event) {
    this.helpTitle = AppStrings.LABEL_PARAM_ALPHA_HELP_TITLE;
    this.helpContent = AppStrings.LABEL_PARAM_ALPHA_HELP_CONTENT;
    this.modalHelpWindow.style.display = 'block';
  }

  parameterHelpBetaButtonClick(event: Event) {
    this.helpTitle = AppStrings.LABEL_PARAM_BETA_HELP_TITLE;
    this.helpContent = AppStrings.LABEL_PARAM_BETA_HELP_CONTENT;
    this.modalHelpWindow.style.display = 'block';
  }

  parameterHelpA1ButtonClick(event: Event) {
    this.helpTitle = AppStrings.LABEL_PARAM_A1_HELP_TITLE;
    this.helpContent = AppStrings.LABEL_PARAM_A1_HELP_CONTENT;
    this.modalHelpWindow.style.display = 'block';
  }

  howToButtonClick(event: Event) {
    this.showHowToWindow();
  }

  private showHowToWindow() {
    this.modalHowToWindow.style.display = 'block';
  }

  howToCloseButtonClick(event: Event) {
    this.closeModalHowToWindow();
  }

  helpCloseButtonClick(event: Event) {
    this.closeModalHelpWindow();
  }

}
