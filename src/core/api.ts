import { presetConfig } from 'entry';
import type {
   DefaultPorts as DP,
   EvNode,
   NodeOnRun,
   NodeError,
} from 'core/types';
import { logLevel } from 'core/debug';
import type { LogLevel } from 'core/debug/types';

export const config = {
   get logLevel(): LogLevel {
      return logLevel();
   },
   set logLevel(level: LogLevel) {
      logLevel(level);
   },
};

export function configure(sth: any): void {}

configure(presetConfig);

namespace UtilType {
   interface SingleTypePorts<T> {
      $I: T;
      $O: T;
      [port: string]: T;
   }

   interface ErrorPort {
      $E: NodeError;
   }

   export type IO<T, U> = unknown extends U
      ? unknown extends T
         ? DP
         : T extends Record<string, unknown>
         ? T & ErrorPort
         : SingleTypePorts<T> & ErrorPort
      : DP<T, U>;
}
export function node<T1, T2 = unknown>(): EvNode<any, UtilType.IO<T1, T2>>;
export function node<T1, T2 = unknown>(
   onrun: NodeOnRun,
): EvNode<any, UtilType.IO<T1, T2>>;
export function node<T1, T2 = unknown, S = any>(
   state: S,
   onrun: NodeOnRun,
): EvNode<S, UtilType.IO<T1, T2>>;
export function node(state?: any, onrun?: any): any {
   ////////////////////
}
