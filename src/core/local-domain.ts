import { log } from 'core/debug';
import { randomString } from 'core/utilities';
import { ElementType, Domain, RemoteDomain } from 'core/types';

export interface LocalDomain extends Domain {
   readonly type: ElementType.LocalDomain;
   /** Domain ID, used to uniquely identify a domain among interconnected domains. */
   readonly id: string;
   /** Every time the program re-runs, `randomRunId` is assigned a new random number. */
   readonly randomRunId: string;
   /** Is this a local domain? */
   readonly isLocal: true;
   readonly nodeUidCounter: number;
   readonly nodeRunIdCounter: number;

   readonly connectedDomains: Set<RemoteDomain>;
   readonly allRemoteDomains: Set<RemoteDomain>;
}

export const LocalDomain: LocalDomain = {
   type: ElementType.LocalDomain,
   id: randomString(10),
   randomRunId: randomString(32),
   isLocal: true,
   nodeUidCounter: 0,
   nodeRunIdCounter: 0,
   connectedDomains: new Set(),
   allRemoteDomains: new Set(),
};

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
export function getNewLocalNodeRunId(): number {
   return (LocalDomain as any).nodeRunCounter++;
}
