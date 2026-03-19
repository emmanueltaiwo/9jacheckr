type Level = 'info' | 'warn' | 'error' | 'debug';

function log(level: Level, msg: string, meta?: Record<string, unknown>) {
  const line = meta ? `${msg} ${JSON.stringify(meta)}` : msg;
  const prefix = `[bot][${level}]`;
  if (level === 'error') console.error(prefix, line);
  else if (level === 'warn') console.warn(prefix, line);
  else console.log(prefix, line);
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => log('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => log('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) =>
    log('error', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) =>
    log('debug', msg, meta),
};
