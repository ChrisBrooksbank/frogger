export const FIXED_DT = 1 / 60;

export interface Timestep {
  /** Adds elapsed seconds; runs `step(dt)` for each whole fixed step. Returns steps run. */
  advance(elapsed: number, step: (dt: number) => void): number;
  /** Fraction of a step left over, in [0, 1). */
  alpha(): number;
  reset(): void;
}

export function createTimestep(dt: number = FIXED_DT, maxSteps = 10): Timestep {
  let acc = 0;
  return {
    advance(elapsed, step) {
      acc += Math.max(0, elapsed);
      let steps = 0;
      while (acc >= dt - 1e-9 && steps < maxSteps) {
        step(dt);
        acc -= dt;
        steps++;
      }
      if (steps === maxSteps)
        acc = 0; // drop backlog (spiral of death)
      else if (acc < 0) acc = 0;
      return steps;
    },
    alpha: () => acc / dt,
    reset() {
      acc = 0;
    },
  };
}
