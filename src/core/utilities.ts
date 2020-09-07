import { Node, VirtualNode, Port, VirtualPort, ElementType } from 'core/types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}

export const promisePendingForever = new Promise<any>(noop);

export function isNative(ctor: any): boolean {
   return typeof ctor === 'function' && /native code/.test(ctor.toString());
}

export const hasSymbol =
   typeof Symbol !== 'undefined' &&
   isNative(Symbol) &&
   typeof Reflect !== 'undefined' &&
   isNative(Reflect.ownKeys);

export function getSymbolAsValue(): symbol {
   return hasSymbol ? Symbol() : ({} as symbol);
}

export function getSymbolAsKey(): symbol {
   return hasSymbol ? Symbol() : ((randomString(32) as any) as symbol);
}

// shallow merge, faster than native implementation `Object.assign`
export function merge<T, U>(target: T, source: U): T & U {
   const keys = Object.keys(source);
   const len = keys.length;
   for (let i = 0; i < len; ++i) {
      (target as any)[keys[i]] = (source as any)[keys[i]];
   }

   return target as T & U;
}
export function mergeTwo<T, U, V>(
   target: T,
   source1: U,
   source2: V,
): T & U & V {
   const keys1 = Object.keys(source1);
   const len1 = keys1.length;
   for (let i = 0; i < len1; ++i) {
      (target as any)[keys1[i]] = (source1 as any)[keys1[i]];
   }

   const keys2 = Object.keys(source1);
   const len2 = keys1.length;
   for (let i = 0; i < len2; ++i) {
      (target as any)[keys2[i]] = (source2 as any)[keys2[i]];
   }

   return target as T & U & V;
}

/**
 * Return a random string of specified length.
 *
 * Each character is randomly selected from [0-9a-zA-Z], except for
 * "l", "o", "I" and "O".  Because these four characters are confusing
 * with 0 and 1.
 */
export function randomString(length = 10): string {
   const chars = '0123456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
   let result = '';
   for (let i = 0; i < length; ++i) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
   }
   return result;
}

type HasElementType = { type: ElementType };

export function isNode(sth: HasElementType): sth is Node {
   return (
      typeof sth.type !== 'undefined' &&
      (sth.type === ElementType.LocalNode ||
         sth.type === ElementType.RemoteNode)
   );
}
export function isPort(sth: HasElementType): sth is Port {
   return (
      typeof sth.type !== 'undefined' &&
      (sth.type === ElementType.LocalPort ||
         sth.type === ElementType.RemotePort)
   );
}

export function isVirtual(
   sth: HasElementType,
): sth is VirtualNode | VirtualPort {
   return (
      typeof sth.type !== 'undefined' &&
      (sth.type === ElementType.VirtualNode ||
         sth.type === ElementType.VirtualPort)
   );
}
export function isVirtualNode(sth: HasElementType): sth is VirtualNode {
   return (
      typeof sth.type !== 'undefined' && sth.type === ElementType.VirtualNode
   );
}
export function isVirtualPort(sth: HasElementType): sth is VirtualPort {
   return (
      typeof sth.type !== 'undefined' && sth.type === ElementType.VirtualPort
   );
}

export function isInteger(value: any): value is number {
   return (
      typeof value === 'number' &&
      isFinite(value) &&
      Math.floor(value) === value
   );
}

export function isPromise(obj: any): obj is Promise<any> {
   return (
      !!obj &&
      (typeof obj === 'object' || typeof obj === 'function') &&
      typeof obj.then === 'function'
   );
}

export function execAsap<FnArgs extends any[]>(
   fns: Array<(...args: FnArgs) => void | Promise<void>>,
   args: FnArgs,
): void | Promise<void> {
   const len = fns.length;
   for (let i = 0; i < len; ++i) {
      const promise = fns[i](...args);
      if (promise !== void 0 && isPromise(promise)) {
         return fns
            .slice(i + 1)
            .reduce((promise, fn) => promise.then(() => fn(...args)), promise);
      }
   }
}

/**
 * An implementation of sorted priority queue.
 * Elements are sorted when inserted, in descending order of priority firstly,
 * then in FIFO.
 */
export class SortedPriorityQueue<E> extends Array<E> {
   // corresponds to the array elements 1 - 1
   public priorities: number[] = [];

   public enqueue(priority: number, element: E): this {
      let i = this.length;

      if (i === 0) {
         this.push(element);
         this.priorities.push(priority);
         return this;
      }

      while (i--) {
         if (this.priorities[i] < priority) {
            if (i === 0) {
               this.unshift(element);
               this.priorities.unshift(priority);
               return this;
            }
         } else {
            this.splice(i + 1, 0, element);
            this.priorities.splice(i + 1, 0, priority);
            return this;
         }
      }

      // Unreachable code, just for avoid TypeScript error.
      return this;
   }

   public dequeue(): E | undefined {
      this.priorities.shift();
      return this.shift();
   }
}

export class Asap {
   private static cancelSymbol = getSymbolAsValue();

   public static tryCatch(
      tryFn: () => void | Promise<void>,
      catchFn: (e: any) => void,
   ): Asap {
      let result: typeof Asap.prototype.result;
      try {
         result = tryFn();
      } catch (e) {
         catchFn(e);
      }
      if (isPromise(result)) {
         result = result.catch((e) => {
            catchFn(e);
            return Asap.cancelSymbol;
         });
      }
      return new Asap(result);
   }

   constructor(
      /**
       * if `result` is not undefined, then it must be a Promise
       * in pending or resolved state, never in rejected state.
       * */
      private result: void | Promise<void | symbol>,
   ) {}

   public thenTryCatch(
      tryFn: () => void | Promise<void>,
      catchFn: (e: any) => void,
   ): this {
      let result = this.result;
      if (isPromise(result)) {
         result = result
            .then((val) => {
               if (val === Asap.cancelSymbol) {
                  return val;
               }
               return tryFn();
            })
            .catch((e) => {
               catchFn(e);
               return Asap.cancelSymbol;
            });
      } else {
         try {
            result = tryFn();
         } catch (e) {
            catchFn(e);
         }
         if (isPromise(result)) {
            result = result.catch((e) => {
               catchFn(e);
               return Asap.cancelSymbol;
            });
         }
      }
      this.result = result;
      return this;
   }
}
