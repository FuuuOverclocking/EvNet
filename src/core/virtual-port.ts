import {
   Node,
   LocalNode,
   RemoteNode,
   VirtualNode,
   PortLike,
   Port,
   ElementType,
   VirtualNodeActionTypes,
} from 'core/types';
import { isNode, isVirtualNode, isPort, isVirtualPort } from 'core/utilities';
import { log, withNC } from 'core/debug';
import { virtualNodeActionQueue } from 'core/virtual-node';

export class VirtualPort implements PortLike {
   public readonly type = ElementType.VirtualPort;
   constructor(readonly name: string, readonly node: VirtualNode) {}

   public pipe<U extends LocalNode>(node: U): U;
   public pipe(node: RemoteNode): RemoteNode;
   public pipe(port: Port): void;
   public pipe<U extends VirtualNode>(node: U): U;
   public pipe(port: VirtualPort): void;
   public pipe(sth: any): any {
      const isNodeLike = isNode(sth) || isVirtualNode(sth);
      const isPortLike = isPort(sth) || isVirtualPort(sth);
      if (!isNodeLike && !isPortLike) {
         log.error(withNC('Invalid arguments.', 0, 'VirtualPort.pipe'));
         throw new Error();
      }

      virtualNodeActionQueue.add({
         type: VirtualNodeActionTypes.PipeAction,
         from: this,
         to: isPortLike ? (sth as Port) : (sth as Node).ports.get('$I'),
      });

      if (isNodeLike) return sth;
      else return;
   }

   public alsoPipe(node: LocalNode): this;
   public alsoPipe(node: RemoteNode): this;
   public alsoPipe(port: Port): this;
   public alsoPipe(node: VirtualNode): this;
   public alsoPipe(port: VirtualPort): this;
   public alsoPipe(sth: any): any {
      this.pipe(sth);
      return this;
   }
}
