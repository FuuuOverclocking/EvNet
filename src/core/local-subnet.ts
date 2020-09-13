import { merge, resolveValueAlongPath } from 'core/utilities';
import {
   Dictionary,
   ElementType,
   LocalGroup,
   Node,
   Subnet,
   RemoteNode,
   VirtualNode,
   UnknownNode,
   NodeOnRun,
   NodeControlInfo,
   NodeEventType,
   PortSet,
   Port,
   RemotePort,
   VirtualPort,
   PickTypeOf$O,
   DefaultPorts as DP,
   NodePortsState,
} from 'core/types';
import { getNewLocalNodeUid, LocalDomain } from 'core/local-domain';
import { getPortSet } from 'core/port-set';
import { LocalNode } from 'core/local-node';
import { LocalPort } from 'core/local-port';
import { stat } from 'fs';

export class LocalSubnet<S = any, P extends object = DP>
   extends LocalNode
   implements Subnet {
   /* Constants */

   // readonly type!: ElementType.LocalNode; // defined on LocalNode's prototype

   // /** The domain this node belongs. */
   // readonly domain!: LocalDomain; // defined on LocalNode's prototype

   // /** The groups this node is in. */
   // readonly group: LocalGroup[] | undefined = void 0;

   // /** Unique ID in LocalDomain used to identify the node */
   // readonly uid: number = getNewLocalNodeUid();

   /** The brand name of the generator that generated this node. */
   readonly brand!: string; // defined on prototype

   readonly isSubnet: true = true;

   /* Variables */

   readonly children: Set<Node> = new Set();

   // // prettier-ignore
   // readonly parent:
   //    | Node
   //    | UnknownNode  // has parent, but the parent does not belong to any known domains
   //    | undefined    // should have parent, but is undefined at this moment
   //    | null         // has no parent, because this is a top-level node
   //    = null;
   // readParent(): Promise<Node | UnknownNode | undefined | null>;

   // prettier-ignore
   constructor(
      public state: S,
   ) {
      super(state);
   }

   // readState(path?: string | string[] | Dictionary<string>): Promise<any>;

   // readonly portsState: NodePortsState = {};
   // readPortsState(): Promise<NodePortsState>;

   /* IO */

   run(data?: any, controlInfo?: NodeControlInfo): void | Promise<void> {
      ////////////
   }

   /* Net structure */

   // readonly ports: PortSet<LocalPort> = getPortSet(LocalPort, this, false);
   readonly innerPorts: PortSet<LocalPort> = getPortSet(LocalPort, this, true);

   // pipe<
   //    U extends
   //       | LocalNode<any, { $I: PickTypeOf$O<P> }>
   //       | RemoteNode
   //       | VirtualNode
   // >(node: U): U;
   // pipe<
   //    U extends
   //       | LocalPort<PickTypeOf$O<P>>
   //       | RemotePort
   //       | VirtualPort
   // >(port: U): void;

   // alsoPipe<
   //    U extends
   //       | LocalNode<any, { $I: PickTypeOf$O<P> }>
   //       | LocalPort<PickTypeOf$O<P>>
   // >(nodeOrPort: U): this;
   // alsoPipe(
   //    nodeOrPort: RemoteNode | RemotePort | VirtualNode | VirtualPort,
   // ): this;

   // unpipe(nodeOrPort: Node | Port): this;

   // isChildOf(node: Subnet): 'deny' | boolean | Promise<'deny' | boolean>;
   // isDescendantOf(node: Subnet): 'deny' | boolean | Promise<'deny' | boolean>;

   /* Events */
   // eslint-disable-next-line @typescript-eslint/ban-types
   on(event: string | NodeEventType, handler: Function, options?: any): void {
      ///////////////
   }

   /*@internal*/
   _emit(event: NodeEventType, args: any[]): any {
      ///////////////
   }

   /* Other */
   toString(): string {
      return `${this.domain.id}: #${this.uid} ${this.brand}`;
   }
}

merge(LocalSubnet.prototype, {
   brand: 'EvSubnet',
});
