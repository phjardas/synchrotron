import * as ProgressBar from 'progress';


export interface Logger {
  debug(message: any, ...args: any[]): void;
  info(message: any, ...args: any[]): void;
  warn(message: any, ...args: any[]): void;
  error(message: any, ...args: any[]): void;
  startProgress(total: number): ProgressBar;
}


export interface LogOptions {
  quiet?: boolean;
  verbose?: boolean;
}


class LogLevel {
  constructor(readonly method: string, readonly level: number) {}
  
  static readonly debug = new LogLevel('debug', 1);
  static readonly info = new LogLevel('info', 2);
  static readonly warn = new LogLevel('warn', 3);
  static readonly error = new LogLevel('error', 4);

  static readonly values = [LogLevel.debug, LogLevel.info, LogLevel.warn, LogLevel.error];
}


function getLogLevel(options: LogOptions): LogLevel {
  if ('quiet' in options && options.quiet) {
    return LogLevel.error;
  }

  if ('verbose' in options && options.verbose) {
    return LogLevel.debug;
  }

  return LogLevel.info;
}


type LogMethod = (message: any, ...args: any[]) => void;
const noOpLogMethod = () => {};


function createLogMethod(level: LogLevel, minLevel: LogLevel): LogMethod {
  if (level.level < minLevel.level) {
    return noOpLogMethod;
  }

  return console[level.method];
}


export function createLogger(options: LogOptions): Logger {
  const level = getLogLevel(options);

  return {
    debug: createLogMethod(LogLevel.debug, level),
    info: createLogMethod(LogLevel.info, level),
    warn: createLogMethod(LogLevel.warn, level),
    error: createLogMethod(LogLevel.error, level),

    startProgress(total: number) {
      const pattern = '[:bar] :task :percent :rate/s :etas';
      const cols = process.stdout.columns;
      const width = cols - 40;
      
      return new ProgressBar(pattern, {
        total,
        width,
        complete: '=',
        incomplete: ' ',
      });
    },
  };
}
