import { ElementType } from 'core/types';
import type { Node, VirtualNode, Port, VirtualPort } from 'core/types';

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
   // "l", "o", "I" and "O" do not appear in the following string,
   // because they are confusing.
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
