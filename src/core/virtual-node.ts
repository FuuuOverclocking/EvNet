import {
   VirtualNodeAction,
   VirtualNode,
   Node,
   VirtualNodeActionTypes,
   Port,
   ElementType,
} from 'core/types';
import { isVirtualPort } from 'core/utilities';
import { PortSet } from 'core/portset';
import { VirtualPort } from 'core/virtual-port';

/**
 * Record the actions taking place on VirtualNode.
 * @internal
 */
export class VirtualNodeActionQueue {
   public queue: VirtualNodeAction[] = [];

   public add(action: VirtualNodeAction): void {
      this.queue.push(action);
   }
   public shift(): VirtualNodeAction | undefined {
      return this.queue.shift();
   }
   public clear(): VirtualNodeAction[] {
      const result = this.queue;
      this.queue = [];
      return result;
   }

   public replaceVirtualNodeWithRealNode(
      virtualNode: VirtualNode,
      realNode: Node,
      doActionsIfPossible = true,
   ): void {
      const len = this.queue.length;
      for (let i = 0; i < len; ++i) {
         const action = this.queue[i];
         switch (action.type) {
            case VirtualNodeActionTypes.PipeAction:
               if (action.from.node === virtualNode) {
                  action.from = realNode.ports.get(action.from.name);
               }
               if (action.to.node === virtualNode) {
                  action.to = realNode.ports.get(action.to.name);
               }
               if (
                  doActionsIfPossible &&
                  !isVirtualPort(action.from) &&
                  !isVirtualPort(action.to)
               ) {
                  this.doAction(action);
                  this.queue.splice(i, 1);
               }
               break;
         }
      }
   }

   public doAction(action: VirtualNodeAction): void {
      switch (action.type) {
         case VirtualNodeActionTypes.PipeAction:
            (action.from as Port).pipe(action.to as Port);
            break;
      }
   }
}

export const virtualNodeActionQueue = new VirtualNodeActionQueue();

export class NextNode implements VirtualNode {
   public readonly type = ElementType.VirtualNode;
   public readonly brand = 'NextNode';
   public readonly ports: PortSet<VirtualPort> = new PortSet<VirtualPort>(
      VirtualPort,
      false,
      this,
   );
}
