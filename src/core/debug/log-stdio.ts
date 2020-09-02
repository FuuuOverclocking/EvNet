import { registerLogService } from 'core/debug';
import type { LogLevel, LoggableObject } from 'core/debug/types';

const logServiceSTDIO = {
   input(level: LogLevel, s: string | LoggableObject) {},
};

registerLogService(logServiceSTDIO);
