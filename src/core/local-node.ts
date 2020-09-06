import {
   ElementType,
   NodeEvents,
   NodeDidRunControlObject,
   NodeDidRunEventHandler,
} from 'core/types';
import type {
   Node,
   RemoteNode,
   VirtualNode,
   UnknownNode,
   Port,
   PortIORole,
   DefaultPorts as DP,
   NodeOnRun,
   NodeControlData,
   PickTypeOf$O,
   NodeWillRunEventHandler,
   NodeWillRunControlObject,
   NodeWillPipeEventHandler,
   NodeDidPipeEventHandler,
   NodeDidUnpipeEventHandler,
} from 'core/types';
import { log } from 'core/debug';
import {
   merge,
   SortedPriorityQueue,
   execAsap,
   isPromise,
   tryCatchThenAsap,
} from 'core/utilities';
import {
   getNewLocalNodeUid,
   LocalDomain,
   getLocalNodeRunId,
} from 'core/local-domain';
import { PortSet } from 'core/portset';
import { LocalPort } from 'core/port';
import type { VirtualPort } from 'core/virtual-port';

export class LocalNode<S = any, P extends object = DP> implements Node {
   /** Unique ID in LocalDomain used to identify the node */
   public readonly uid: number = getNewLocalNodeUid();

   public readonly type!: ElementType.LocalNode; // defined on prototype

   // default value "LocalNode" is defined on prototype
   public readonly brand!: string;

   public readonly isSubnet: boolean = false;

   public readonly ports: PortSet<LocalPort> = new PortSet<LocalPort>(
      LocalPort,
      false,
      this,
   );
   public readonly parent: Node | UnknownNode | undefined;
   public readonly domain!: typeof LocalDomain; // defined on prototype

   constructor(public state: S, public onrun: NodeOnRun) {}

   /*@internal*/
   public _handlers: {
      nodeWillRun?: SortedPriorityQueue<NodeWillRunEventHandler>;
      nodeDidRun?: SortedPriorityQueue<NodeDidRunEventHandler>;
      nodeWillOutput?: undefined;
      nodeWillPipe?: SortedPriorityQueue<NodeWillPipeEventHandler>;
      nodeDidPipe?: SortedPriorityQueue<NodeDidPipeEventHandler>;
      nodeDidUnpipe?: SortedPriorityQueue<NodeDidUnpipeEventHandler>;
      error: undefined;
   } = {
      nodeWillRun: void 0,
      nodeDidRun: void 0,
      nodeWillOutput: void 0,
      nodeWillPipe: void 0,
      nodeDidPipe: void 0,
      nodeDidUnpipe: void 0,
      error: void 0,
   };

   /**
    * Trigger a specific event on this node.
    * @internal
    */
   public _emit(
      type: NodeEvents.NodeWillRunEvent,
      thisNode: this,
      control: NodeWillRunControlObject,
   ): void | Promise<void>;
   public _emit(
      type: NodeEvents.NodeDidRunEvent,
      thisNode: this,
      control: NodeDidRunControlObject,
   ): void | Promise<void>;
   public _emit(
      type: NodeEvents.NodeWillPipeEvent,
      thisNode: LocalNode,
      thisPort: LocalPort,
      targetNode: Node,
      targetPort: Port,
      thisPortDirection: PortIORole.In | PortIORole.Out,
   ): boolean;
   public _emit(
      type: NodeEvents.NodeDidPipeEvent | NodeEvents.NodeDidUnpipeEvent,
      thisNode: LocalNode,
      thisPort: LocalPort,
      targetNode: Node,
      targetPort: Port,
      thisPortDirection: PortIORole.In | PortIORole.Out,
   ): void;
   public _emit(type: NodeEvents, ...args: any[]): any {
      switch (type) {
         case NodeEvents.NodeWillRunEvent: {
            // should return void | Promise<void>
            if (!this._handlers.nodeWillRun) return;

            const control = args[1] as NodeWillRunControlObject;
            const handlers = this._handlers.nodeWillRun;

            const len = handlers.length;
            for (let i = 0; i < len; ++i) {
               const promise = handlers[i](...(args as [any, any]));
               if (control.preventRunning) {
                  return;
               }
               if (promise !== void 0 && isPromise(promise)) {
                  return handlers.slice(i + 1).reduce(
                     (promise, fn) =>
                        promise.then(() => {
                           if (!control.preventRunning) {
                              return fn(...(args as [any, any]));
                           }
                        }),
                     promise,
                  );
               }
            }

            return;
         }

         case NodeEvents.NodeDidRunEvent:
            // should return void | Promise<void>
            if (!this._handlers.nodeDidRun) return;
            return execAsap(this._handlers.nodeDidRun, args as [any, any]);

         case NodeEvents.NodeWillPipeEvent:
            // should return boolean
            if (!this._handlers.nodeWillPipe) return true;

            for (const handler of this._handlers.nodeWillPipe) {
               if (!handler(...(args as [any, any, any, any, any]))) {
                  return false;
               }
            }
            return true;

         case NodeEvents.NodeDidPipeEvent:
            // should return nothing
            if (!this._handlers.nodeDidPipe) return;

            for (const handler of this._handlers.nodeDidPipe) {
               handler(...(args as [any, any, any, any, any]));
            }
            return;
         case NodeEvents.NodeDidUnpipeEvent:
            // should return nothing
            if (!this._handlers.nodeDidUnpipe) return;

            for (const handler of this._handlers.nodeDidUnpipe) {
               handler(...(args as [any, any, any, any, any]));
            }
            return;

         default:
      }
   }

   /**
    * Return the `state` of this LocalNode directly.
    */
   public readState(): S;
   /**
    * Return the value of state parsed along the given path.
    * @example
    * readState("eat.big.apple")
    * // return this.state.eat.big.apple
    */
   public readState(path: string): any;
   public readState(path?: string): any {
      if (!path) return this.state;

      let result: any = this.state;
      for (const prop of path.split('.')) {
         if (result === void 0) return void 0;
         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
         result = result[prop];
      }
      return result;
   }

   public toString(): string {
      return `${this.domain.id}: ${this.brand}#${this.uid}`;
   }

   public run(
      data?: any,
      controlData?: NodeControlData,
      getInformation?: () => void,
   ): void | Promise<void> {
      controlData || (controlData = {});

      const runId = getLocalNodeRunId();
      log.debug(`[RunID=${runId}] Node "${this.toString()}" start running.`);

      const control: NodeWillRunControlObject = {
         data,
         controlData,
         preventRunning: false,
      };

      tryCatchThenAsap(
         /* try */
         () => this._emit(NodeEvents.NodeWillRunEvent, this, control),
         /* catch */
         (e: any) => {
            /////////////////////////
         },
         /* then */
         () => {
            if (control.preventRunning) {
               ////////////////////////////
            }
         },
      );
   }

   public pipe<U extends LocalNode<any, { $I: PickTypeOf$O<P> }>>(node: U): U;
   public pipe(node: RemoteNode): RemoteNode;
   public pipe<U extends Port<PickTypeOf$O<P>>>(port: U): void;
   public pipe<U extends VirtualNode>(node: U): U;
   public pipe(port: VirtualPort): void;
   public pipe(sth: any): any {
      return this.ports.get('$O').pipe(sth);
   }

   public alsoPipe<U extends LocalNode<any, { $I: PickTypeOf$O<P> }>>(
      node: U,
   ): this;
   public alsoPipe(node: RemoteNode): this;
   public alsoPipe<U extends Port<PickTypeOf$O<P>>>(port: U): this;
   public alsoPipe<U extends VirtualNode>(node: U): this;
   public alsoPipe(port: VirtualPort): this;
   public alsoPipe(sth: any): any {
      this.ports.get('$O').pipe(sth);
      return this;
   }

   public unpipe<U extends LocalNode<any, { $I: PickTypeOf$O<P> }>>(
      node: U,
   ): this;
   public unpipe(port: Port): this;
   public unpipe(sth: any): this {
      this.ports.get('$O').unpipe(sth);
      return this;
   }
}

merge(LocalNode.prototype, {
   brand: 'LocalNode',
   domain: LocalDomain,
   type: ElementType.LocalNode,
});
