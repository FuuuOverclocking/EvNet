export * from 'core/debug/types';
import {
   LogLevel,
   LogService,
   LoggableObject,
   MessageWithNodeAndComponent,
} from 'core/debug/types';
import { Node } from 'core/types';

let currentLogLevel = LogLevel.Info;

export function logLevel(level?: LogLevel): LogLevel {
   if (level !== void 0) {
      currentLogLevel = level;
   }
   return currentLogLevel;
}

function shouldLog(level: LogLevel): boolean {
   return currentLogLevel <= level;
}

const logServices: LogService[] = [];

function logMessage(level: LogLevel, s: string | LoggableObject): void {
   if (!shouldLog(level)) return;

   for (const service of logServices) {
      service.input(level, s);
   }
}

export function log(s: string | LoggableObject): void {
   logMessage(LogLevel.Info, s);
}

export namespace log {
   export function error(s: string | LoggableObject): void {
      logMessage(LogLevel.Error, s);
   }

   export function warn(s: string | LoggableObject): void {
      logMessage(LogLevel.Warn, s);
   }

   export function info(s: string | LoggableObject): void {
      logMessage(LogLevel.Info, s);
   }

   export function debug(s: string | LoggableObject): void {
      logMessage(LogLevel.Debug, s);
   }
}

export function withNC(
   msg: string,
   node?: Node | 0,
   comp?: string,
): MessageWithNodeAndComponent {
   return { msg, node: node || void 0, comp };
}

export function registerLogService(...services: LogService[]): void {
   logServices.push(...services);
}
