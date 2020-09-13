import {
   ElementType,
   Node,
   Port,
   PortIORole,
   RemoteNode,
   VirtualNode,
   VirtualPort,
} from 'core/types';

export class RemotePort implements Port {
   readonly type!: ElementType.RemotePort;
   readonly name!: string;
   readonly node!: RemoteNode;

   readonly isInner!: boolean;

   readonly direction!: PortIORole;
   readonly ioType!: PortIORole;

   toString(): string {
      return '';
   }

   put(data: any): void {}

   pipe<U extends Node | VirtualNode>(node: U): U;
   pipe(port: Port | VirtualPort): void;
   pipe(sth: any): any {}

   /*@internal*/
   _beRequestedPipe(
      port: Port,
      myIOType: PortIORole.In | PortIORole.Out,
   ): boolean | Promise<boolean> {
      return true;
   }

   alsoPipe(nodeOrPort: Node | VirtualNode | Port | VirtualPort): this {
      return this;
   }

   unpipe(nodeOrPort: Node | Port): this {
      return this;
   }

   /*@internal*/
   _notifyUnpipe(port: Port): void {}
}
