import { logLevel } from 'core/debug';
import { LogLevel } from 'core/debug/types';
import { LocalDomain, updateLocalDomainID } from 'core/local-domain';
import { isInteger, merge, randomString } from 'core/utilities';

export const config = {
   get logLevel(): LogLevel {
      return logLevel();
   },
   set logLevel(level: LogLevel) {
      logLevel(level);
   },
   get localDomainID(): string {
      return LocalDomain.id;
   },
   set localDomainID(id: string) {
      updateLocalDomainID(id);
   },
};

interface EvNetConfigurationObject {
   logLevel?: 'off' | 'error' | 'warn' | 'info' | 'debug' | LogLevel;
   silent?: true;
   localDomain?: {
      id?: string;
      randomIdLength?: number;
   };
}

export function configure(cfg: EvNetConfigurationObject): void {
   const cfgToMerge: Partial<typeof config> = {};

   // set logLevel
   if (cfg.silent) {
      cfgToMerge.logLevel = LogLevel.Off;
      if (cfg.logLevel !== void 0) {
         throw new Error(
            '[EvNet][configure]: "silent" and "logLevel" are mutually exclusive.',
         );
      }
   } else if (cfg.logLevel !== void 0) {
      let logLevel: number | string = cfg.logLevel;

      if (isInteger(logLevel) && logLevel >= 0 && logLevel <= 4) {
         cfgToMerge.logLevel = logLevel;
      } else if (typeof logLevel === 'string') {
         logLevel = logLevel.toLocaleLowerCase();
         const index = ['off', 'error', 'warn', 'info', 'debug'].indexOf(
            logLevel,
         );
         if (index === -1) {
            throw new Error('[EvNet][configure]: Invalid argument.');
         }
         cfgToMerge.logLevel = index;
      } else {
         throw new Error('[EvNet][configure]: Invalid argument.');
      }
   }

   // set localDomainID
   if (cfg.localDomain) {
      const { localDomain } = cfg;
      if (typeof localDomain.id === 'string') {
         if (localDomain.randomIdLength !== void 0) {
            throw new Error(
               '[EvNet][configure]: "localDomain.id" and ' +
                  '"localDomain.randomIdLength" are mutually exclusive.',
            );
         }
         if (localDomain.id.length <= 1 || localDomain.id.length >= 128) {
            throw new Error(
               '[EvNet][configure]: Invalid length of localDomainID.',
            );
         }
         cfgToMerge.localDomainID = localDomain.id;
      } else if (typeof localDomain.randomIdLength === 'number') {
         if (
            localDomain.randomIdLength <= 1 ||
            localDomain.randomIdLength >= 128
         ) {
            throw new Error(
               '[EvNet][configure]: Invalid length of localDomainID.',
            );
         }
         cfgToMerge.localDomainID = randomString(localDomain.randomIdLength);
      }
   }

   merge(config, cfgToMerge);
}
