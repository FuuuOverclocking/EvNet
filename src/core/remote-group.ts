import { ElementType, Group, RemoteDomain } from 'core/types';

export interface RemoteGroup extends Group {
   readonly type: ElementType.RemoteGroup;
   readonly domain: RemoteDomain;
}
