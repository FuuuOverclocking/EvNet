import { log, withNC } from 'core/debug';
import {
   Dictionary,
   LocalNode,
   LocalPort,
   RemoteNode,
   RemotePort,
   VirtualNode,
   PortLike,
} from 'core/types';

type DecideNodeType<P extends PortLike> = P extends LocalPort
   ? LocalNode
   : P extends RemotePort
   ? RemoteNode
   : VirtualNode;

export type PortSet<P extends PortLike> = {
   get(portName: string): P;
} & Dictionary<P>;

export function getPortSet<P extends PortLike>(
   PortConstructor: any,
   node: DecideNodeType<P>,
   isInner: boolean,
): PortSet<P> {
   return {
      get(portName: string): P {
         if (portName.charAt(0) !== '$' || portName.length < 2) {
            log.error(withNC('Illegal port name.', 0, 'PortSet.get'));
            throw new Error();
         }
         if (!this.isInner && portName === '$IE') {
            log.error(
               withNC(
                  'The use of Node outer port named "$IE" is prohibited.',
                  0,
                  'PortSet.get',
               ),
            );
            throw new Error();
         }
         return (
            this[portName] ||
            (this[portName] = new PortConstructor(portName, node, isInner))
         );
      },
   } as any;
}
