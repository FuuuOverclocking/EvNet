import type { Node } from 'core/types';

export const enum LogLevel {
   Off = 0,
   Error = 1,
   Warn = 2,
   Info = 3,
   Debug = 4,
}

export interface LogService {
   input(level: LogLevel, s: string | LoggableObject): void;
}

export interface LoggableObject {
   msg: string;
}

export interface MessageWithNodeAndComponent extends LoggableObject {
   msg: string;
   node?: Node;
   comp?: string;
}
