export class SurfaceParameters {
    d: number;
    A: number;
    alpha: number;
    beta: number;
    a: number;
    b: number;
    mu: number;
    omega: number;
    phi: number;
    thetaMax: number;
    divisions: number;
    showWireframe: boolean;
    color: number;

    public static Shell1() {
        let p = new SurfaceParameters();
        p.d = 1;
        p.A = 12.2;
        p.alpha = 87.9;
        p.beta = 4;
        p.a = 1.3;
        p.b = 1.5;
        p.mu = 1;
        p.omega = -2;
        p.phi = 55;
        return p;
    }

    public static Shell2() {
        let p = new SurfaceParameters();
        p.d = 1;
        p.A = 7.0;
        p.alpha = 88;
        p.beta = 12;
        p.a = 6.0;
        p.b = 1.5;
        p.mu = 0;
        p.omega = 0;
        p.phi = 78;
        return p;
    }

    public static Shell3() {
        let p = new SurfaceParameters();
        p.d = 1;
        p.A = 5.0;
        p.alpha = 84;
        p.beta = 85;
        p.a = 2.5;
        p.b = 4.5;
        p.mu = 1;
        p.omega = 5;
        p.phi = 20;
        return p;
    }

    public static Shell4() {
        let p = new SurfaceParameters();
        p.d = 1;
        p.A = 4.5;
        p.alpha = 5;
        p.beta = 90;
        p.a = 6.0;
        p.b = 6.0;
        p.mu = 0;
        p.omega = -50;
        p.phi = 0;
        return p;
    }


    constructor() {
        this.thetaMax = 2;
        this.d = 1;
        this.A = 0;
        this.alpha = 0;
        this.beta = 0;
        this.a = 0;
        this.b = 0;
        this.mu = 0;
        this.omega = 0;
        this.phi = 0;
        this.divisions     = 50;
        this.showWireframe = false;
        this.color = 0xF00000;
    }
}
