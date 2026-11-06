export type Command = 'up' | 'down' | 'left' | 'right' | 'start' | 'pause' | 'mute';

export type CommandHandler = (command: Command) => void;

/** Minimal sink all input devices feed into. */
export interface CommandSink {
  dispatch(command: Command): void;
  subscribe(handler: CommandHandler): () => void;
}

export function createCommandSink(): CommandSink {
  const handlers = new Set<CommandHandler>();
  return {
    dispatch(command) {
      for (const h of [...handlers]) h(command);
    },
    subscribe(handler) {
      handlers.add(handler);
      return () => {
        handlers.delete(handler);
      };
    },
  };
}
