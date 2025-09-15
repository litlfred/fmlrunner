import winston from 'winston';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silly';

/**
 * Logger class providing structured logging throughout the FML Runner
 */
export class Logger {
  private logger: winston.Logger;

  constructor(component: string, level: LogLevel = 'info') {
    this.logger = winston.createLogger({
      level,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.label({ label: component })
      ),
      defaultMeta: { component },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: any): void {
    this.logger.verbose(message, meta);
  }

  silly(message: string, meta?: any): void {
    this.logger.silly(message, meta);
  }

  child(meta: any): Logger {
    const childLogger = new Logger('child', this.logger.level as LogLevel);
    childLogger.logger = this.logger.child(meta);
    return childLogger;
  }
}