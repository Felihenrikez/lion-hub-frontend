import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const LEVEL_STYLES: Record<LogLevel, string> = {
  info: 'color: #22c55e; font-weight: bold',
  warn: 'color: #eab308; font-weight: bold',
  error: 'color: #ef4444; font-weight: bold',
  debug: 'color: #3b82f6; font-weight: bold'
};

@Injectable({ providedIn: 'root' })
export class LoggerService {
  info(message: string, meta?: Record<string, unknown>): void {
    this.write('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.write('warn', message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.write('error', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.write('debug', message, meta);
  }

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    if (environment.production && !environment.enableHttpLogging) {
      return;
    }

    const timestamp = this.formatTimestamp(new Date());
    const metaStr = meta && Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    const output = `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;

    switch (level) {
      case 'error':
        console.error(`%c${output}`, LEVEL_STYLES.error);
        break;
      case 'warn':
        console.warn(`%c${output}`, LEVEL_STYLES.warn);
        break;
      case 'debug':
        console.debug(`%c${output}`, LEVEL_STYLES.debug);
        break;
      default:
        console.info(`%c${output}`, LEVEL_STYLES.info);
    }
  }

  private formatTimestamp(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, '0');

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join('-') + ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}
