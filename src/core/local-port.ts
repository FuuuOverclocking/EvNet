import { log, withNC } from 'core/debug';
import { merge } from 'core/utilities';
import {
   ElementType,
   LocalNode,
   Node,
   RemoteNode,
   VirtualNode,
   Port,
   RemotePort,
   VirtualPort,
   PortIORole,
} from 'core/types';

function ioRole2String(ioRole: PortIORole) {
   return ['output', 'input', 'undetermined'][ioRole];
}

export class LocalPort<T = any> implements Port {
   readonly type!: ElementType.LocalPort; // defined on prototype

   constructor(
      readonly name: string,
      readonly node: LocalNode,
      readonly isInner: boolean,
      direction?: PortIORole.Out | PortIORole.In,
   ) {
      if (direction !== void 0) {
         this._determineDirection(direction);
      } else {
         this.direction = PortIORole.Undetermined;
         this.ioType = PortIORole.Undetermined;
      }
   }

   readonly direction!: PortIORole;
   readonly ioType!: PortIORole;
   readonly links: Array<LocalPort<T> | RemotePort> = [];

   private _determineDirection(dir: PortIORole.Out | PortIORole.In): void {
      if (this.direction === dir) return;

      if (this.direction !== PortIORole.Undetermined) {
         const right = ioRole2String(this.ioType);
         const wrong = ioRole2String(1 - this.ioType);

         log.error(
            withNC(
               `${this} is an ${right} port, but used as an ${wrong} port.`,
               this.node,
               'LocalPort._determineDirection',
            ),
         );
         throw new Error();
      }

      if (this.name === '$E' && dir !== PortIORole.Out) {
         log.error(
            withNC(
               `$E can only be used as an output port.`,
               this.node,
               'LocalPort._determineDirection',
            ),
         );
         throw new Error();
      }

      if (this.name === '$IE' && dir !== PortIORole.In) {
         log.error(
            withNC(
               `[inner].$IE can only be used as an output port.`,
               this.node,
               'LocalPort._determineDirection',
            ),
         );
         throw new Error();
      }

      (this as any).direction = dir;
      (this as any).ioType = +this.isInner ^ dir;
      if (this.isInner) {
         const outerPort = this.node.ports.get(this.name) as any;
         outerPort.direction = dir;
         outerPort.ioType = dir;
      } else if (this.node.isSubnet) {
         const innerPort = (this.node as LocalSubnet).innerPorts.get(
            this.name,
         ) as any;
         innerPort.direction = dir;
         innerPort.ioType = 1 ^ dir;
      }
   }

   toString(): string {
      if (this.isInner) {
         return `[${this.node.toString()}].[inner].${this.name}`;
      } else {
         return `[${this.node.toString()}].${this.name}`;
      }
   }

   put(data: any): void {
      ////////////
   }

   // prettier-ignore
   pipe<
      U extends
         | LocalNode<any, { $I: T }>
         | RemoteNode
         | VirtualNode
   >(node: U): U;
   // prettier-ignore
   pipe<
      U extends
         | LocalPort<T>
         | RemotePort
         | VirtualPort
   >(port: U): void;
   pipe(sth: any): any {
      ////////////
   }

   /*@internal*/
   _beRequestedPipe(
      port: Port,
      myIOType: PortIORole.In | PortIORole.Out,
   ): boolean | Promise<boolean> {
      return true;
   }

   alsoPipe<U extends LocalNode<any, { $I: T }> | LocalPort<T>>(
      nodeOrPort: U,
   ): this;
   alsoPipe(
      nodeOrPort: RemoteNode | RemotePort | VirtualNode | VirtualPort,
   ): this;
   alsoPipe(sth: any): any {
      ///////////////
   }

   unpipe(nodeOrPort: Node | Port): this {
      return this;
   }

   /*@internal*/
   _notifyUnpipe(port: Port): void {
      //////////////////
   }
}

merge(LocalPort.prototype, {
   type: ElementType.LocalPort,
});
