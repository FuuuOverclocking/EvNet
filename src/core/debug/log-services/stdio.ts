import { registerLogService } from 'core/debug';
import type { LogLevel, LoggableObject } from 'core/debug/types';

const logServiceStdIO = {
   input(level: LogLevel, s: string | LoggableObject) {},
};

registerLogService(logServiceStdIO);
