import {
   Node,
   LocalNode,
   LocalSubnet,
   RemoteNode,
   VirtualNode,
   Port,
   RemotePort,
   VirtualPort,
   ElementType,
   PortIORole,
   NodeEvents,
   VirtualNodeActionTypes,
} from 'core/types';
import { log, withNC } from 'core/debug';
import {
   isNode,
   isVirtualNode,
   isVirtualPort,
   isPort,
   isVirtual,
   merge,
} from 'core/utilities';
import { virtualNodeActionQueue } from 'core/virtual-node';

function ioRole2String(ioRole: PortIORole) {
   return ['output', 'input', 'undetermined'][ioRole];
}

export class LocalPort<T = any> implements Port<T> {
   public readonly type!: ElementType.LocalPort; // defined on prototype

   constructor(
      public readonly name: string,
      public readonly node: LocalNode,
      public readonly isInner: boolean,
      direction?: PortIORole,
   ) {
      this.direction = direction ?? PortIORole.Undetermined;
   }

   /*
    * The difference between `direction` and `ioType` is that, `direction` is
    * determined by { Node, PortName }, while `ioType` is determined by
    * { Node, inner or outer, PortName }.
    *
    * Ports that have the same `name`, but on the different side (inner or outer)
    * of Node, have the same `direction` and the opposite `ioType` (if the
    * direction have been determined).
    *
    * Meanwhile, `ioType` updates as `direction` updates.
    */

   private _direction!: PortIORole;
   public get direction(): PortIORole {
      return this._direction;
   }
   public set direction(dir: PortIORole) {
      this._direction = dir;
      this._ioType =
         dir === PortIORole.Undetermined
            ? dir
            : +this.isInner ^ this._direction;
   }

   private _ioType!: PortIORole;
   public get ioType(): PortIORole {
      return this._ioType;
   }

   private _determineDirection(dir: PortIORole): void {
      if (this._direction === dir) return;

      if (this._direction === PortIORole.Undetermined) {
         if (this.isInner) {
            this.direction = dir;
            this.node.ports.get(this.name).direction = dir;
         } else {
            this.direction = dir;
            if (this.node.isSubnet) {
               (this.node as LocalSubnet).innerPorts.get(
                  this.name,
               ).direction = dir;
            }
         }
         log.debug(
            withNC(
               `The direction of [${this.node}].${
                  this.name
               } was determined to be ${ioRole2String(dir)}.`,
            ),
         );
      } else {
         const right = ioRole2String(this._ioType);
         const wrong = ioRole2String(1 - this._ioType);

         log.error(
            withNC(
               `${this} is an ${right} port, but used as an ${wrong} port.`,
               this.node,
               'LocalPort._determineDirection',
            ),
         );
         throw new Error();
      }
   }

   public links: Port<T>[] = [];

   private _setupOrBreakLink(
      isSetup: true,
      port: Port,
      myIOType: PortIORole,
   ): void;
   private _setupOrBreakLink(isSetup: false, port: Port): boolean;
   private _setupOrBreakLink(
      isSetup: boolean,
      port: Port,
      myIOType?: PortIORole,
   ): boolean | void {
      if (isSetup) {
         // setup link
         this._determineDirection(+this.isInner ^ myIOType!);
         this.links.push(port);
         this.node._emit(
            NodeEvents.NodeDidPipeEvent,
            this.node,
            this,
            port.node,
            port,
            +this.isInner ^ myIOType!,
         );
      } else {
         // break link
         const index = this.links.indexOf(port);
         if (index === -1) return false;

         this.links.splice(index, 1);
         this.node._emit(
            NodeEvents.NodeDidUnpipeEvent,
            this.node,
            this,
            port.node,
            port,
            this._ioType as any,
         );
         return true;
      }
   }

   public toString(): string {
      if (this.isInner) {
         return `[${this.node.toString()}].[inner].${this.name}`;
      } else {
         return `[${this.node.toString()}].${this.name}`;
      }
   }

   public put(data: T): void {
      switch (this._ioType) {
         case PortIORole.Out:
            for (const port of this.links) {
               void port.node.run(data, { port });
            }
            return;

         case PortIORole.In:
            void this.node.run(data, { port: this });
            return;

         case PortIORole.Undetermined:
            log.warn(
               withNC(
                  `Cannot transfer data to the port ${this} as ` +
                     `its direction has not yet been determined.`,
                  this.node,
                  'LocalPort.put',
               ),
            );
            return;
      }
   }

   public pipe<U extends LocalNode<any, { $I: T }>>(node: U): U;
   public pipe(node: RemoteNode): RemoteNode;
   public pipe<U extends Port<T>>(port: U): void;
   public pipe<U extends VirtualNode>(node: U): U;
   public pipe(port: VirtualPort): void;

   public pipe(sth: any): any {
      const isNodeLike = isNode(sth) || isVirtualNode(sth);
      const isPortLike = isPort(sth) || isVirtualPort(sth);
      if (!isNodeLike && !isPortLike) {
         log.error(withNC('Invalid argument.', this.node, 'LocalPort.pipe'));
         throw new Error();
      }
      const _isVirtual = isVirtual(sth);

      if (_isVirtual) {
         virtualNodeActionQueue.add({
            type: VirtualNodeActionTypes.PipeAction,
            from: this,
            to: isPortLike
               ? (sth as VirtualPort)
               : (sth as VirtualNode).ports.get('$I'),
         });

         return isNodeLike ? sth : void 0;
      }

      const thatPort = isPortLike
         ? (sth as Port)
         : (sth as Node).ports.get('$I');

      if (thatPort.ioType === PortIORole.Out) {
         log.error(
            withNC(
               `${thatPort} is an output port, but used as an input port.`,
               this.node,
               'LocalPort.pipe',
            ),
         );
         throw new Error();
      }

      // 1. Trigger "NodeWillPipeEvent" on this node, if pipe is allowed, continue.
      const shouldPipe = this.node._emit(
         NodeEvents.NodeWillPipeEvent,
         this.node,
         this,
         thatPort.node,
         thatPort,
         +this.isInner ^ PortIORole.Out,
      );

      if (shouldPipe) {
         // 2. Issue a pipe request to the given port, which would trigger
         //    "NodeWillPipeEvent" on the node to which it belongs. If the request
         //    is allowed, continue.

         // The result of request will be a Promise<boolean> if `thatPort` is a
         // RemotePort.
         const allowPipe = thatPort._beRequestedPipe(this, PortIORole.In);

         if (typeof allowPipe === 'boolean') {
            this._pipeRequestGotResponse(allowPipe, thatPort, PortIORole.Out);
         } else {
            allowPipe.then(
               (allow) =>
                  this._pipeRequestGotResponse(allow, thatPort, PortIORole.Out),
               () =>
                  log.error(
                     `Pipe ${this} → ${thatPort} failed because LocalDomain` +
                        ` didn't receive a valid response from ${thatPort}.`,
                  ),
            );
         }
      } else {
         log.info(`Pipe ${this} → ${thatPort} was refused by ${this}.`);
      }

      return isNodeLike ? sth : void 0;
   }

   /**
    * When this port is requested to connect to another port, this method is
    * called by that port. That port must be ready to establish the connection
    * before calling this method.  Therefore, this port just need to test if
    * this node allows to pipe, and then establish the connection immediately.
    */
   public _beRequestedPipe(
      port: Port,
      myIOType: PortIORole.In | PortIORole.Out,
   ): boolean {
      let ups: string;
      let dws: string;

      myIOType === PortIORole.In
         ? ((ups = port.toString()), (dws = this.toString()))
         : ((ups = this.toString()), (dws = port.toString()));

      if (
         this._ioType !== PortIORole.Undetermined &&
         this._ioType !== myIOType
      ) {
         const ioTypeToString = ioRole2String(this._ioType);
         log.info(
            withNC(
               `Pipe ${ups} → ${dws} was refused because ${this} is an` +
                  `${ioTypeToString} port.`,
               this.node,
               'LocalPort._beRequestedPipe',
            ),
         );
         return false;
      }
      const shouldPipe = this.node._emit(
         NodeEvents.NodeWillPipeEvent,
         this.node,
         this,
         port.node,
         port,
         +this.isInner ^ myIOType,
      );
      if (shouldPipe) {
         this._setupOrBreakLink(true, port, myIOType);
         log.debug(`Pipe ${ups} → ${dws} .`);
      } else {
         log.info(`Pipe ${ups} → ${dws} was refused by ${this}.`);
      }
      return shouldPipe;
   }

   private _pipeRequestGotResponse(
      allowPipe: boolean,
      port: Port,
      myIOType: PortIORole,
   ): void {
      let ups: string;
      let dws: string;

      myIOType === PortIORole.In
         ? ((ups = port.toString()), (dws = this.toString()))
         : ((ups = this.toString()), (dws = port.toString()));

      if (allowPipe) {
         this._setupOrBreakLink(true, port, myIOType);
         log.debug(`Pipe ${ups} → ${dws} .`);
      } else {
         log.info(`Pipe ${ups} → ${dws} was refused by ${port}.`);
      }
   }

   /**
    * Why is there such a method?
    * The call to `RemotePort.pipe(LocalPort)` will be converted to
    * `LocalPort._bePiped(RemotePort)`.
    * `NodeWillPipeEvent` would always be triggered on LocalNode firstly, then
    * on RemoteNode, for saving time.
    * @internal
    */
   public _bePiped(port: RemotePort): void {
      // 1. Trigger "NodeWillPipeEvent" on this node, if pipe is allowed, continue.
      const shouldPipe = this.node._emit(
         NodeEvents.NodeWillPipeEvent,
         this.node,
         this,
         port.node,
         port,
         +this.isInner ^ PortIORole.In,
      );

      if (!shouldPipe) {
         log.info(`Pipe ${port} → ${this} was refused by ${this}.`);
         return;
      }

      // 2. Issue a pipe request to the given port, which would trigger
      //    "NodeWillPipeEvent" on the node to which it belongs. If the request
      //    is allowed, continue.

      // The result of request will be a Promise<boolean> if `thatPort` is a
      // RemotePort.
      const allowPipe = port._beRequestedPipe(this, PortIORole.Out);

      if (typeof allowPipe === 'boolean') {
         this._pipeRequestGotResponse(allowPipe, port, PortIORole.In);
      } else {
         allowPipe.then(
            (allow) => this._pipeRequestGotResponse(allow, port, PortIORole.In),
            () =>
               log.error(
                  `Pipe ${port} → ${this} failed because LocalDomain` +
                     ` didn't receive a valid response from ${port}.`,
               ),
         );
      }
   }

   public alsoPipe<U extends LocalNode<any, { $I: T }>>(node: U): this;
   public alsoPipe(node: RemoteNode): this;
   public alsoPipe<U extends Port<T>>(port: U): this;
   public alsoPipe<U extends VirtualNode>(node: U): this;
   public alsoPipe(port: VirtualPort): this;
   public alsoPipe(sth: any): this {
      this.pipe(sth);
      return this;
   }

   public unpipe(node: Node): this;
   public unpipe(port: Port): this;
   public unpipe(sth: any): this {
      if (isNode(sth)) {
         sth = sth.ports.get('$I');
      } else if (!isPort(sth)) {
         log.error(withNC('Invalid argument.', this.node, 'LocalPort.unpipe'));
         throw new Error();
      }

      if (this._setupOrBreakLink(false, sth)) {
         log.debug(`${this} unpiped with ${sth}.`);
         (sth as Port)._notifyUnpipe(this);
      } else {
         log.warn(
            withNC(
               `${this} is not connected to ${sth} while executing "LocalPort.unpipe".`,
               this.node,
               'LocalPort.unpipe',
            ),
         );
      }
      return this;
   }

   public _notifyUnpipe(port: Port): void {
      if (this._setupOrBreakLink(false, port)) {
         log.info(`${this} unpiped with ${port}.`);
      }
   }
}

merge(LocalPort.prototype, {
   type: ElementType.LocalPort,
});
