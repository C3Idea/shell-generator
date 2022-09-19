export function random(a: number, b: number): number {
    return Math.random() * (b - a) + a;
}

export function toRadians(degrees: number) {
    return degrees * (Math.PI / 180);
}

