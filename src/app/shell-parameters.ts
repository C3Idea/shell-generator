import { createSeededGenerator, hashStringToSeed, randomWithGenerator } from "src/util";

// The parameters the player controls with sliders in the game; the others are
// copied from the target (#28).
export type PlayedParameterKey = 'A' | 'alpha' | 'beta' | 'a';

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
    static distMin: number = 0;
    static distMax: number = 100;

    static readonly playedParameterKeys: ReadonlyArray<PlayedParameterKey> = ['A', 'alpha', 'beta', 'a'];
    private static readonly playedParameterRanges: Readonly<Record<PlayedParameterKey, readonly [number, number]>> = {
        A:     [ShellParameters.AMin, ShellParameters.AMax],
        alpha: [ShellParameters.alphaMin, ShellParameters.alphaMax],
        beta:  [ShellParameters.betaMin, ShellParameters.betaMax],
        a:     [ShellParameters.aMin, ShellParameters.aMax],
    };

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
        p.theta = 8;
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
        p.theta = 8;
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
        p.theta = 8;
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

    static randomParameters(seed?: string): ShellParameters {
        let p = new ShellParameters();
        const generator = seed === undefined
            ? Math.random
            : createSeededGenerator(hashStringToSeed(seed));
        p.d = 1;
        p.A = randomWithGenerator(ShellParameters.AMin, ShellParameters.AMax, generator);
        p.alpha = randomWithGenerator(ShellParameters.alphaMin, ShellParameters.alphaMax, generator);
        p.beta = randomWithGenerator(ShellParameters.betaMin, ShellParameters.betaMax, generator);
        p.a = randomWithGenerator(ShellParameters.aMin, ShellParameters.aMax, generator);
        p.b = randomWithGenerator(ShellParameters.bMin, ShellParameters.bMax, generator);
        p.mu = randomWithGenerator(ShellParameters.muMin, ShellParameters.muMax, generator);
        p.omega = randomWithGenerator(ShellParameters.omegaMin, ShellParameters.omegaMax, generator);
        p.phi = randomWithGenerator(ShellParameters.phiMin, ShellParameters.phiMax, generator);
        p.theta = randomWithGenerator(ShellParameters.thetaMin, ShellParameters.thetaMax, generator);
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

    // Heat-bar reading (#28): each played parameter's difference divided by
    // its slider range, combined so a match reads 0 and all four at opposite
    // ends read 100. The copied parameters always match, so they're left out.
    distance(other: ShellParameters): number {
        let sum = 0;
        for (const key of ShellParameters.playedParameterKeys) {
            const [min, max] = ShellParameters.playedParameterRanges[key];
            sum += ((this[key] - other[key]) / (max - min)) ** 2;
        }
        const reading = Math.sqrt(sum / ShellParameters.playedParameterKeys.length);
        return ShellParameters.distMin + reading * (ShellParameters.distMax - ShellParameters.distMin);
    }
}
