export function random(a: number, b: number): number {
    return Math.random() * (b - a) + a;
}

export function randomWithGenerator(a: number, b: number, generator: () => number): number {
    return generator() * (b - a) + a;
}

export function hashStringToSeed(input: string): number {
    // FNV-1a 32-bit hash for stable string-to-seed conversion.
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

export function createSeededGenerator(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        // Mulberry32 PRNG: fast and deterministic for UI/game seeding.
        state += 0x6D2B79F5;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
}

