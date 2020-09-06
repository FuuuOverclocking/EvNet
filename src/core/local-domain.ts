import { LocalDomain as LD, ElementType } from 'core/types';
import { randomString } from 'core/utilities';
import { log } from 'core/debug';

export const LocalDomain: LD = (function () {
   return {
      type: ElementType.LocalDomain,
      id: randomString(),
      isLocal: true,
      nodeUidCounter: 0,
      nodeRunCounter: 0,
   } as LD;
})();

/*@internal*/
export function updateLocalDomainID(newID: string): void {
   (LocalDomain as any).id = newID;
   log.info(`LocalDomain is named "${newID}".`);
}

/*@internal*/
export function getNewLocalNodeUid(): number {
   return (LocalDomain as any).uidCounter++;
}

/*@internal*/
export function getLocalNodeRunId(): number {
   return (LocalDomain as any).nodeRunCounter++;
}
