export type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export interface Flow {
  state: GameState;
  highScore: number;
  /** Score of the run that just ended (valid in 'gameover'). */
  finalScore: number;
  /** True if the finished run beat the previous high score. */
  newHighScore: boolean;
}

export function createFlow(highScore = 0): Flow {
  return { state: 'title', highScore, finalScore: 0, newHighScore: false };
}

/** Enter/Space: title -> playing, gameover -> title. No-op otherwise. */
export function advance(flow: Flow): GameState {
  if (flow.state === 'title') {
    flow.state = 'playing';
    flow.finalScore = 0;
    flow.newHighScore = false;
  } else if (flow.state === 'gameover') {
    flow.state = 'title';
  }
  return flow.state;
}

/** P/Escape: playing <-> paused. No-op in other states. */
export function togglePause(flow: Flow): GameState {
  if (flow.state === 'playing') flow.state = 'paused';
  else if (flow.state === 'paused') flow.state = 'playing';
  return flow.state;
}

/** Ends the current run (playing -> gameover) and records the high score. */
export function endGame(flow: Flow, finalScore: number): boolean {
  if (flow.state !== 'playing') return false;
  flow.state = 'gameover';
  flow.finalScore = finalScore;
  flow.newHighScore = finalScore > flow.highScore;
  if (flow.newHighScore) flow.highScore = finalScore;
  return true;
}
