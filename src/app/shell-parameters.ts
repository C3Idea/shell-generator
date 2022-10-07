import { random } from "src/util";

export class ShellParameters {
    d: number;
    A: number;
    alpha: number;
    beta: number;
    a: number;
    b: number;
    mu: number;
    omega: number;
    phi: number;
    theta: number;

    ShellParameters = ShellParameters;
    
    static AMin: number = 5;
    static AMax: number = 13;
    static alphaMin: number = 80;
    static alphaMax: number = 90;
    static betaMin: number = 0;
    static betaMax: number = 85;
    static aMin: number = 1;
    static aMax: number = 6;
    static bMin: number = 1;
    static bMax: number = 6;
    static muMin: number = 0;
    static muMax: number = 45;
    static omegaMin: number = -10;
    static omegaMax: number = 10;
    static phiMin: number = 20;
    static phiMax: number = 80;
    static thetaMin: number = 2;
    static thetaMax: number = 16;

    static Shell1(): ShellParameters {
        let p = new ShellParameters();
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

    static Shell2(): ShellParameters {
        let p = new ShellParameters();
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

    static Shell3(): ShellParameters {
        let p = new ShellParameters();
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

    static Shell4(): ShellParameters {
        let p = new ShellParameters();
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

    static randomParameters(): ShellParameters {
        let p = new ShellParameters();
        p.d = 1;
        p.A = random(ShellParameters.AMin, ShellParameters.AMax);
        p.alpha = random(ShellParameters.alphaMin, ShellParameters.alphaMax);
        p.beta = random(ShellParameters.betaMin, ShellParameters.betaMax);
        p.a = random(ShellParameters.aMin, ShellParameters.aMax);
        p.b = random(ShellParameters.bMin, ShellParameters.bMax);
        p.mu = random(ShellParameters.muMin, ShellParameters.muMax);
        p.omega = random(ShellParameters.omegaMin, ShellParameters.omegaMax);
        p.phi = random(ShellParameters.phiMin, ShellParameters.phiMax);
        p.theta = random(ShellParameters.thetaMin, ShellParameters.thetaMax);
        return p;
    }


    constructor() {
        this.d = 1;
        this.A = ShellParameters.AMin;
        this.alpha = ShellParameters.alphaMin;
        this.beta = ShellParameters.betaMin;
        this.a = ShellParameters.aMin;
        this.b = ShellParameters.bMin;
        this.mu = ShellParameters.muMin;
        this.omega = ShellParameters.omegaMin;
        this.phi = ShellParameters.phiMin;
        this.theta = ShellParameters.thetaMin;
    }
}
