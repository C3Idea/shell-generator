import { random } from "src/util";

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
    
    AMin: number = 5;
    AMax: number = 13;
    alphaMin: number = 80;
    alphaMax: number = 90;
    betaMin: number = 0;
    betaMax: number = 85;
    aMin: number = 1;
    aMax: number = 6;
    bMin: number = 1;
    bMax: number = 6;
    muMin: number = 0;
    muMax: number = 45;
    omegaMin: number = -10;
    omegaMax: number = 10;
    phiMin: number = 20;
    phiMax: number = 80; 

    static Shell1(): SurfaceParameters {
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

    static Shell2(): SurfaceParameters {
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

    static Shell3(): SurfaceParameters {
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

    static Shell4(): SurfaceParameters {
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

    static randomParameters(): SurfaceParameters {
        let p = new SurfaceParameters();
        p.d = 1;
        p.A = random(p.AMin, p.AMax);
        p.alpha = random(p.alphaMin, p.alphaMax);
        p.beta = random(p.betaMin, p.betaMax);
        p.a = random(p.aMin, p.aMax);
        p.b = random(p.bMin, p.bMax);
        p.mu = random(p.muMin, p.muMax);
        p.omega = random(p.omegaMin, p.omegaMax);
        p.phi = random(p.phiMin, p.phiMax);
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
    }
}
