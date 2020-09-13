import {
   ElementType,
   Node,
   Port,
   PortLike,
   VirtualNode,
   VirtualNodeActionType,
} from 'core/types';
import {
   isNode,
   isPort,
   isVirtualNode,
   isVirtualPort,
   merge,
} from 'core/utilities';
import { log, withNC } from 'core/debug';

export class VirtualPort implements PortLike {
   readonly type!: ElementType.VirtualPort; // defined on prototype
   constructor(readonly name: string, readonly node: VirtualNode) {}

   public pipe<U extends Node | VirtualNode>(node: U): U;
   public pipe(port: Port | VirtualPort): void;
   public pipe(sth: any): any {
      const isNodeLike = isNode(sth) || isVirtualNode(sth);
      const isPortLike = isPort(sth) || isVirtualPort(sth);
      if (!isNodeLike && !isPortLike) {
         log.error(withNC('Invalid arguments.', 0, 'VirtualPort.pipe'));
         throw new Error();
      }

      virtualNodeActionQueue.add({
         type: VirtualNodeActionType.Pipe,
         from: this,
         to: isPortLike ? (sth as Port) : (sth as Node).ports.get('$I'),
      });

      if (isNodeLike) return sth;
      else return;
   }

   alsoPipe(nodeOrPort: Node | VirtualNode | Port | VirtualPort): this {
      this.pipe(nodeOrPort as any);
      return this;
   }
}
merge(VirtualPort.prototype, { type: ElementType.VirtualPort });
