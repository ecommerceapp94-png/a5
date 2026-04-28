// Deterministic pseudo-random helpers so mock data is stable across reloads.
let seed = 0x9e3779b1;

export function setSeed(value: number): void {
  seed = value >>> 0;
}

export function nextInt(): number {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed;
}

export function nextFloat(): number {
  return nextInt() / 0xffffffff;
}

export function pick<T>(items: readonly T[]): T {
  return items[nextInt() % items.length];
}

export function range(min: number, max: number): number {
  return min + Math.floor(nextFloat() * (max - min + 1));
}

export function bool(probability = 0.5): boolean {
  return nextFloat() < probability;
}

export function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = nextInt() % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
