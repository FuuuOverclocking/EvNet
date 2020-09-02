import { LocalDomain as LD, ElementType } from 'core/types';
import { randomString } from 'core/utilities';

export const LocalDomain: LD = (function () {
   return {
      type: ElementType.LocalDomain,
      id: randomString(),
      isLocal: true,
      nodeUidCounter: 0,
   } as LD;
})();

export function getNewLocalNodeUid(): number {
   return (LocalDomain as any).uidCounter++;
}
