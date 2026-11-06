import type { Command, CommandSink } from './commands';

const KEY_MAP: Record<string, Command> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  W: 'up',
  S: 'down',
  A: 'left',
  D: 'right',
  Enter: 'start',
  ' ': 'start',
  p: 'pause',
  P: 'pause',
  Escape: 'pause',
  m: 'mute',
  M: 'mute',
};

export function commandForKey(key: string): Command | undefined {
  return Object.prototype.hasOwnProperty.call(KEY_MAP, key) ? KEY_MAP[key] : undefined;
}

export interface KeyEventLike {
  key: string;
  repeat: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  preventDefault(): void;
}

export interface KeyTarget {
  addEventListener(type: 'keydown', listener: (e: KeyEventLike) => void): void;
  removeEventListener(type: 'keydown', listener: (e: KeyEventLike) => void): void;
}

/** Handles one keydown: ignores auto-repeat and modified keys. Returns the command, if any. */
export function handleKeyDown(e: KeyEventLike, sink: CommandSink): Command | undefined {
  if (e.ctrlKey || e.metaKey || e.altKey) return undefined;
  const command = commandForKey(e.key);
  if (!command) return undefined;
  e.preventDefault();
  if (e.repeat) return undefined;
  sink.dispatch(command);
  return command;
}

/** Attaches keyboard handling to a target; returns a detach function. */
export function attachKeyboard(target: KeyTarget, sink: CommandSink): () => void {
  const listener = (e: KeyEventLike) => void handleKeyDown(e, sink);
  target.addEventListener('keydown', listener);
  return () => target.removeEventListener('keydown', listener);
}
