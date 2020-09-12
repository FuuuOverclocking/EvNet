import { Domain, ElementType } from 'core/types';

export interface RemoteDomain extends Domain {
   readonly type: ElementType.RemoteDomain;
   /** Domain ID, used to uniquely identify a domain among interconnected domains. */
   readonly id: string;
   /** Every time the program runs, `randomRunId` is assigned a random string. */
   readonly randomRunId: string;
   readonly isLocal: false;
}
