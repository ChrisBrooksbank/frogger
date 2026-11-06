import { describe, expect, it, vi } from 'vitest';
import { createCommandSink, type Command } from './commands';
import { attachKeyboard, commandForKey, handleKeyDown, type KeyEventLike } from './keyboard';

function key(k: string, extra: Partial<KeyEventLike> = {}): KeyEventLike {
  return { key: k, repeat: false, preventDefault: vi.fn(), ...extra };
}

function setup() {
  const sink = createCommandSink();
  const got: Command[] = [];
  sink.subscribe((c) => got.push(c));
  return { sink, got };
}

describe('keyboard input', () => {
  it('maps arrows and WASD to directions', () => {
    expect(commandForKey('ArrowUp')).toBe('up');
    expect(commandForKey('ArrowDown')).toBe('down');
    expect(commandForKey('ArrowLeft')).toBe('left');
    expect(commandForKey('ArrowRight')).toBe('right');
    expect(commandForKey('w')).toBe('up');
    expect(commandForKey('s')).toBe('down');
    expect(commandForKey('a')).toBe('left');
    expect(commandForKey('D')).toBe('right');
  });

  it('maps start, pause and mute keys', () => {
    expect(commandForKey('Enter')).toBe('start');
    expect(commandForKey(' ')).toBe('start');
    expect(commandForKey('p')).toBe('pause');
    expect(commandForKey('Escape')).toBe('pause');
    expect(commandForKey('m')).toBe('mute');
  });

  it('ignores unknown keys, including prototype names', () => {
    expect(commandForKey('x')).toBeUndefined();
    expect(commandForKey('toString')).toBeUndefined();
  });

  it('dispatches once per press and ignores auto-repeat', () => {
    const { sink, got } = setup();
    handleKeyDown(key('ArrowUp'), sink);
    handleKeyDown(key('ArrowUp', { repeat: true }), sink);
    handleKeyDown(key('ArrowUp', { repeat: true }), sink);
    expect(got).toEqual(['up']);
  });

  it('prevents default for handled keys (even repeats) but not others', () => {
    const { sink } = setup();
    const handled = key('ArrowDown', { repeat: true });
    const other = key('x');
    handleKeyDown(handled, sink);
    handleKeyDown(other, sink);
    expect(handled.preventDefault).toHaveBeenCalled();
    expect(other.preventDefault).not.toHaveBeenCalled();
  });

  it('ignores keys with modifiers', () => {
    const { sink, got } = setup();
    handleKeyDown(key('a', { ctrlKey: true }), sink);
    handleKeyDown(key('m', { metaKey: true }), sink);
    expect(got).toEqual([]);
  });

  it('attaches and detaches a listener', () => {
    const { sink, got } = setup();
    let listener: ((e: KeyEventLike) => void) | undefined;
    const target = {
      addEventListener: (_t: 'keydown', l: (e: KeyEventLike) => void) => void (listener = l),
      removeEventListener: (_t: 'keydown', l: (e: KeyEventLike) => void) => {
        if (listener === l) listener = undefined;
      },
    };
    const detach = attachKeyboard(target, sink);
    listener?.(key('d'));
    expect(got).toEqual(['right']);
    detach();
    expect(listener).toBeUndefined();
  });

  it('allows unsubscribing from the sink', () => {
    const sink = createCommandSink();
    const fn = vi.fn();
    const off = sink.subscribe(fn);
    sink.dispatch('start');
    off();
    sink.dispatch('start');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
