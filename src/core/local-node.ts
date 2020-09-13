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
import { LocalPort } from 'core/local-port';

export class LocalNode<S = any, P extends object = DP> implements Node {
   /* Constants */

   readonly type!: ElementType.LocalNode; // defined on prototype

   /** The domain this node belongs. */
   readonly domain!: LocalDomain; // defined on prototype

   /** The groups this node is in. */
   readonly group: LocalGroup[] | undefined = void 0;

   /** Unique ID in LocalDomain used to identify the node */
   readonly uid: number = getNewLocalNodeUid();

   /** The brand name of the generator that generated this node. */
   readonly brand!: string; // defined on prototype

   readonly isSubnet: boolean = false;

   /* Variables */

   // prettier-ignore
   readonly parent:
      | Node
      | UnknownNode  // has parent, but the parent does not belong to any known domains
      | undefined    // should have parent, but is undefined at this moment
      | null         // has no parent, because this is a top-level node
      = null;
   readParent(): Promise<Node | UnknownNode | undefined | null> {
      return Promise.resolve(this.parent);
   }

   // prettier-ignore
   constructor(
      public state: S,
      public onrun?: NodeOnRun<P>,
   ) { }

   readState(path?: string | string[] | Dictionary<string>): Promise<any> {
      if (!path) return Promise.resolve(this.state);

      if (typeof path === 'string') {
         return Promise.resolve(resolveValueAlongPath(this.state, path));
      }
      if (Array.isArray(path)) {
         return Promise.resolve(
            path.map((p) => resolveValueAlongPath(this.state, p)),
         );
      }
      if (typeof path === 'object') {
         const result = {} as Dictionary<any>;
         for (const [key, p] of Object.entries(path)) {
            result[key] = resolveValueAlongPath(this.state, p);
         }
         return Promise.resolve(result);
      }
      return Promise.resolve();
   }

   readonly portsState: NodePortsState = {};
   readPortsState(): Promise<NodePortsState> {
      return Promise.resolve(this.portsState);
   }

   /* IO */

   run(data?: any, controlInfo?: NodeControlInfo): void | Promise<void> {
      ////////////
   }

   /* Net structure */

   readonly ports: PortSet<LocalPort> = getPortSet(LocalPort, this, false);

   // prettier-ignore
   pipe<
      U extends
         | LocalNode<any, { $I: PickTypeOf$O<P> }>
         | RemoteNode
         | VirtualNode
   >(node: U): U;
   // prettier-ignore
   pipe<
      U extends
         | LocalPort<PickTypeOf$O<P>>
         | RemotePort
         | VirtualPort
   >(port: U): void;
   pipe(nodeOrPort: any): any {
      return this.ports.get('$O').pipe(nodeOrPort);
   }

   alsoPipe<
      U extends
         | LocalNode<any, { $I: PickTypeOf$O<P> }>
         | LocalPort<PickTypeOf$O<P>>
   >(nodeOrPort: U): this;
   alsoPipe(
      nodeOrPort: RemoteNode | RemotePort | VirtualNode | VirtualPort,
   ): this;
   alsoPipe(nodeOrPort: any): this {
      this.ports.get('$O').pipe(nodeOrPort);
      return this;
   }

   unpipe(nodeOrPort: Node | Port): this {
      this.ports.get('$O').unpipe(nodeOrPort);
      return this;
   }

   isChildOf(node: Subnet): 'deny' | boolean | Promise<'deny' | boolean> {
      return true;
   }
   isDescendantOf(node: Subnet): 'deny' | boolean | Promise<'deny' | boolean> {
      return true;
   }

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

merge(LocalNode.prototype, {
   brand: 'EvNode',
   domain: LocalDomain,
   type: ElementType.LocalNode,
});
