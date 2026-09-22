import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ShellParameters } from '../shell-parameters';
import { ShellViewer } from '../shell-viewer';
import { AppStrings } from '../app-strings';
import { random } from 'src/util';

type TargetParameterKey = 'd' | 'A' | 'alpha' | 'beta' | 'a' | 'b' | 'mu' | 'omega' | 'phi' | 'theta';

@Component({
  selector: 'app-surface',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})


export class GameComponent implements OnInit, AfterViewInit {
  private static readonly targetParameterKeys: ReadonlyArray<TargetParameterKey> = [
    'd', 'A', 'alpha', 'beta', 'a', 'b', 'mu', 'omega', 'phi', 'theta'
  ];

  // Slider ranges. 'd' (coiling direction) has no slider and is always 1 in the
  // game, so a link can't change it.
  private static readonly parameterRanges: Readonly<Partial<Record<TargetParameterKey, readonly [number, number]>>> = {
    d:     [1, 1],
    A:     [ShellParameters.AMin, ShellParameters.AMax],
    alpha: [ShellParameters.alphaMin, ShellParameters.alphaMax],
    beta:  [ShellParameters.betaMin, ShellParameters.betaMax],
    a:     [ShellParameters.aMin, ShellParameters.aMax],
    b:     [ShellParameters.bMin, ShellParameters.bMax],
    mu:    [ShellParameters.muMin, ShellParameters.muMax],
    omega: [ShellParameters.omegaMin, ShellParameters.omegaMax],
    phi:   [ShellParameters.phiMin, ShellParameters.phiMax],
    theta: [ShellParameters.thetaMin, ShellParameters.thetaMax],
  };

  // Parameters the player controls with the sliders.
  private static readonly playerParameterKeys: ReadonlyArray<'A' | 'alpha' | 'beta' | 'a'> = [
    'A', 'alpha', 'beta', 'a'
  ];
  private static readonly maxStartAttempts = 20;

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
  gameId: string = "";

  constructor(private router: Router, private route: ActivatedRoute) {
    this.parameters = new ShellParameters();
    const linkTarget = this.targetParametersFromRoute();
    this.targetParameters = linkTarget ?? ShellParameters.randomParameters();
    this.setupGame(linkTarget !== null);
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

  private setupGame(fromLink: boolean = false) {
    // We fix some parameters
    this.parameters.mu  = this.targetParameters.mu;
    this.parameters.phi = this.targetParameters.phi;
    this.parameters.omega = this.targetParameters.omega;
    this.parameters.b     = this.targetParameters.b;
    this.parameters.theta = this.targetParameters.theta;
    if (fromLink) {
      this.randomizePlayerStart();
    }
  }

  // A shared link may target the sliders' minimums, so link games start at a
  // random position that doesn't already win.
  private randomizePlayerStart() {
    for (let attempt = 0; attempt < GameComponent.maxStartAttempts; attempt++) {
      for (const key of GameComponent.playerParameterKeys) {
        const [min, max] = GameComponent.parameterRanges[key]!;
        this.parameters[key] = random(min, max);
      }
      if (!this.checkParametersAreSimilar()) {
        return;
      }
    }
    // Fallback: the slider end farther from the target is always outside the win margin.
    for (const key of GameComponent.playerParameterKeys) {
      const [min, max] = GameComponent.parameterRanges[key]!;
      const target = this.targetParameters[key];
      this.parameters[key] = target - min > max - target ? min : max;
    }
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

  private newGame(seed?: string) {
    this.clearTargetFromUrl();
    this.parameters       = new ShellParameters();
    this.targetParameters = ShellParameters.randomParameters(seed);
    this.setupGame();
    this.distance         = this.parameters.distance(this.targetParameters);
    this.setupShellViewers();
    this.setShellVisibility();
    this.createShellGraphs();
    this.checkGameIsOver();
  }

  newGameButtonClick(event: Event) {
    event.preventDefault();
    const gameId = window.prompt("Clave de juego", this.gameId);
    if (gameId === null) {
      return;
    }
    this.gameId = gameId;
    this.closeModalWindow();
    this.newGame(gameId);
  }

  async generateTargetLinkButtonClick(event: Event): Promise<void> {
    event.preventDefault();
    const link = this.getShareableGameLink();
    const copied = await this.copyTextToClipboard(link);
    if (!copied) {
      window.prompt(AppStrings.LABEL_LINK_PROMPT, link);
      return;
    }
    window.alert(AppStrings.LABEL_LINK_COPIED);
  }

  private getShareableGameLink(): string {
    const target = this.encodeTargetParameters(this.parameters);
    const pathname = window.location.pathname.replace(/\/$/, '');
    const deploymentPath = pathname.endsWith('/game')
      ? pathname.slice(0, -'/game'.length)
      : pathname;
    const encodedTarget = encodeURIComponent(target);
    return `${window.location.origin}${deploymentPath}/#/game?target=${encodedTarget}`;
  }

  private async copyTextToClipboard(text: string): Promise<boolean> {
    if (!navigator.clipboard?.writeText) {
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      return true;
    }
    catch {
      return false;
    }
  }

  // Drop ?target so reloading after New Game doesn't bring the shared challenge back.
  private clearTargetFromUrl() {
    if (!this.route.snapshot.queryParamMap.has('target')) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { target: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private targetParametersFromRoute(): ShellParameters | null {
    const encodedTarget = this.route.snapshot.queryParamMap.get('target');
    if (encodedTarget === null || encodedTarget.trim() === '') {
      return null;
    }
    return this.decodeTargetParameters(encodedTarget);
  }

  private encodeTargetParameters(parameters: ShellParameters): string {
    return GameComponent.targetParameterKeys
      .map(key => +parameters[key].toFixed(2))
      .join(',');
  }

  private decodeTargetParameters(encodedParameters: string): ShellParameters | null {
    const parts = encodedParameters.split(',');
    if (parts.length !== GameComponent.targetParameterKeys.length) {
      return null;
    }
    const parameters = new ShellParameters();
    for (let i = 0; i < GameComponent.targetParameterKeys.length; i++) {
      const value = parseFloat(parts[i]);
      if (Number.isNaN(value)) {
        return null;
      }
      const key = GameComponent.targetParameterKeys[i];
      const range = GameComponent.parameterRanges[key];
      // Clamp so an edited link can't set a target the sliders can't reach.
      parameters[key] = range ? Math.min(Math.max(value, range[0]), range[1]) : value;
    }
    return parameters;
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
