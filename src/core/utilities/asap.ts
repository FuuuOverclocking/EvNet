import { getSymbol, isPromise } from 'core/utilities/index';

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

export class Asap {
   private static cancelSymbol = getSymbol('string');

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
