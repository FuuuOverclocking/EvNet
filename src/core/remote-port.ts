import {
   ElementType,
   Node,
   LocalNode,
   RemoteNode,
   VirtualNode,
   Port,
   PortIORole,
   VirtualPort,
} from 'core/types';

export class RemotePort implements Port<any> {
   public readonly type = ElementType.RemotePort;

   public direction!: PortIORole;
   public ioType!: PortIORole;

   // public links: Port<T>[] = [];

   constructor(
      public readonly name: string,
      public readonly node: RemoteNode,
      public readonly isInner: boolean,
   ) {}
   public put(data: any): void {}

   public pipe<U extends LocalNode>(node: U): U;
   public pipe(node: RemoteNode): RemoteNode;
   public pipe(port: Port): void;
   public pipe<U extends VirtualNode>(node: U): U;
   public pipe(port: VirtualPort): void;
   public pipe(sth: any): any {}

   /**
    * When this port is requested to connect to another port, this method is
    * called by that port. That port must be ready to establish the connection
    * before calling this method.  Therefore, this port just need to test if
    * this node allows to pipe, and then establish the connection immediately.
    */
   public _beRequestedPipe(
      port: Port,
      myIOType: PortIORole.In | PortIORole.Out,
   ): Promise<boolean> {
      return Promise.resolve(true);
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

   public unpipe(node: Node): this;
   public unpipe(port: Port): this;
   public unpipe(sth: any): this {
      return this;
   }
   public _notifyUnpipe(port: Port): void {}
}
