import type {
   LocalPort,
   RemotePort,
   PortLike,
   RemoteNode,
   VirtualNode,
} from 'core/types';
import type { LocalNode } from 'core/local-node';

type DecideNodeType<T extends PortLike> = T extends LocalPort
   ? LocalNode
   : T extends RemotePort
   ? RemoteNode
   : VirtualNode;

export class PortSet<T extends PortLike> {
   constructor(
      private readonly PortClass: any,
      public readonly isInner: boolean,
      public readonly node: DecideNodeType<T>,
   ) {}

   public get(portName: string): T {
      // eslint-disable-next-line
      const PortClass = this.PortClass;
      return (
         (this as any)[portName] ||
         // eslint-disable-next-line
         ((this as any)[portName] = new PortClass(
            portName,
            this.node,
            this.isInner,
         ))
      );
   }
}
