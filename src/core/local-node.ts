import {
   Node,
   DefaultPorts as DP,
   ElementType,
   LocalGroup,
   UnknownNode,
   Dictionary,
   NodePortsState,
   NodeControlInfo,
} from 'core/types';
import { merge, resolveValueAlongPath } from 'core/utilities';
import { getNewLocalNodeUid, LocalDomain } from 'core/local-domain';

export class LocalNode<S = any, P extends object = DP> implements Node {
   /* Constants */

   readonly type!: ElementType.LocalNode; // defined on prototype

   /** The domain this node belongs. */
   readonly domain!: LocalDomain; // defined on prototype

   /** The groups this node is in. */
   readonly group: LocalGroup[] | undefined;

   /** Unique ID in LocalDomain used to identify the node */
   readonly uid: number = getNewLocalNodeUid();

   /** The brand name of the generator that generated this node. */
   readonly brand!: string;

   readonly isSubnet: boolean = false;

   /* Variables */

   // prettier-ignore
   readonly parent:
      | Node
      | UnknownNode  // has parent, but the parent does not belong to any known domains
      | undefined    // should have parent, but is undefined at this moment
      | null         // has no parent, because this node is a top-level node
      = null;
   readParent(): Promise<Node | UnknownNode | undefined | null> {
      return Promise.resolve(this.parent);
   }

   state: any;
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

   run(data?: any, controlInfo?: NodeControlInfo): void | Promise<void> {
      ////////////
   }
}

merge(LocalNode.prototype, {
   brand: 'EvNode',
   domain: LocalDomain,
   type: ElementType.LocalNode,
});
