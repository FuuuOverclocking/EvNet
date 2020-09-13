import { merge } from 'core/utilities';
import {
   Dictionary,
   ElementType,
   LocalGroup,
   RemoteDomain,
   RemoteGroup,
   Node,
   Subnet,
   LocalNode,
   VirtualNode,
   UnknownNode,
   NodeControlInfo,
   NodePortsState,
   NodeEventType,
   Port,
   RemotePort,
   VirtualPort,
} from 'core/types';
import { PortSet } from 'core/port-set';

export class RemoteNode implements Node {
   constructor() {
      // need to determine the constants ...
   }

   /* Constants */

   readonly type!: ElementType.RemoteNode; // defined on prototype

   /** The domain this node belongs. */
   readonly domain!: RemoteDomain;
   /** The group this node is from. */
   readonly group!: LocalGroup | RemoteGroup;

   readonly uid!: number;
   readonly brand!: string;
   readonly isSubnet!: boolean;

   /* Variables */

   // prettier-ignore
   readonly parent:
      | Node
      | UnknownNode  // has parent, but the parent does not belong to any known domains
      | undefined    // should have parent, but is undefined at this moment
      | null         // has no parent, because this node is a top-level node
      | "deny"        // access denied
      ;
   readParent(): Promise<Node | UnknownNode | undefined | null> | 'deny' {
      return 'deny';
   }

   state: any | /* access denied */ 'deny';
   readState(
      path?: string | string[] | Dictionary<string>,
   ): Promise<any> | 'deny' {
      return 'deny';
   }

   readonly portsState: NodePortsState | /* access denied */ 'deny' = 'deny';
   readPortsState(): Promise<NodePortsState> | 'deny' {
      return 'deny';
   }

   /* IO */

   run(data?: any, controlInfo?: NodeControlInfo): void | Promise<void> {
      /////////////////
   }

   /* Net structure */

   readonly ports!: PortSet<RemotePort>;

   pipe<U extends LocalNode | RemoteNode | VirtualNode>(node: U): U;
   pipe(port: Port | VirtualPort): void;
   pipe(nodeOrPort: any): any {
      ////////////
   }

   alsoPipe(
      nodeOrPort: LocalNode | RemoteNode | VirtualNode | VirtualPort,
   ): this {
      // ......
      return this;
   }

   unpipe(nodeOrPort: Node | Port): this {
      // ........
      return this;
   }

   isChildOf(node: Subnet): 'deny' | boolean | Promise<'deny' | boolean> {
      return 'deny';
   }
   isDescendantOf(node: Subnet): 'deny' | boolean | Promise<'deny' | boolean> {
      return 'deny';
   }

   /* Events */
   // eslint-disable-next-line @typescript-eslint/ban-types
   on(event: string | NodeEventType, handler: Function, options?: any): void {
      ////////////////
   }

   /*@internal*/
   _emit(event: NodeEventType, args: any[]): any {
      ////////////////////
   }

   /* Other */
   toString(): string {
      return `${this.domain.id}: #${this.uid} ${this.brand}`;
   }
}

merge(RemoteNode.prototype, {
   type: ElementType.RemoteNode,
});
