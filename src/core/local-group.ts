import { ElementType, Group, LocalDomain } from 'core/types';

export interface LocalGroup extends Group {
   readonly type: ElementType.LocalGroup;
   readonly domain: LocalDomain;
}
