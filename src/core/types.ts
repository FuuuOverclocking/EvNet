import type { LocalNode } from 'core/local-node';
import type { LocalSubnet } from 'core/local-subnet';
import type { LocalPort } from 'core/local-port';
import type { RemotePort } from 'core/remote-port';
import type { PortSet } from 'core/portset';
import type { VirtualNodeActionQueue, NextNode } from 'core/virtual-node';
import type { VirtualPort } from 'core/virtual-port';

export {
   LocalNode,
   LocalSubnet,
   LocalPort,
   RemotePort,
   PortSet,
   VirtualNodeActionQueue,
   NextNode,
   VirtualPort,
};

export const enum ElementType {
   LocalDomain,
   RemoteDomain,
   LocalGroup,
   RemoteGroup,
   LocalNode,
   RemoteNode,
   VirtualNode,
   UnknownNode,
   LocalPort,
   RemotePort,
   VirtualPort,
}

export interface Domain {
   readonly type: ElementType.LocalDomain | ElementType.RemoteDomain;
   readonly id: string;
   readonly isLocal: boolean;
}

export interface LocalDomain extends Domain {
   readonly type: ElementType.LocalDomain;
   readonly id: string;
   readonly isLocal: true;
   readonly nodeUidCounter: number;
   readonly nodeRunCounter: number;
}

export interface RemoteDomain extends Domain {
   readonly type: ElementType.RemoteDomain;
   readonly id: string;
   readonly isLocal: false;
}

export interface Group {
   readonly type: ElementType.LocalGroup | ElementType.RemoteGroup;
   readonly domain: Domain;
}

export type NodeLikeType =
   | ElementType.LocalNode
   | ElementType.RemoteNode
   | ElementType.VirtualNode
   | ElementType.UnknownNode;

export interface NodeLike {
   readonly type: NodeLikeType;
}

export interface Node extends NodeLike {
   readonly type: ElementType.LocalNode | ElementType.RemoteNode;

   readonly uid: number;
   readonly brand: string;
   readonly isSubnet: boolean;
   readonly ports: PortSet<LocalPort | RemotePort>;
   readonly parent: Node | UnknownNode | undefined;
   readonly domain: LocalDomain | RemoteDomain;

   readState(path?: string): any | Promise<any>;
   toString(): string;
   run(data?: any, controlData?: NodeControlData): void | Promise<void>;

   pipe<U extends LocalNode>(node: U): U;
   pipe(node: RemoteNode): RemoteNode;
   pipe(port: Port): void;
   pipe<U extends VirtualNode>(node: U): U;
   pipe(port: VirtualPort): void;

   alsoPipe(node: Node): this;
   alsoPipe(port: Port): this;
   alsoPipe(node: VirtualNode): this;
   alsoPipe(port: VirtualPort): this;

   unpipe(node: Node): this;
   unpipe(port: Port): this;
}

export interface Subnet extends Node {
   readonly isSubnet: true;
   readonly innerPorts: PortSet<LocalPort | RemotePort>;
   readonly children: Set<Node>;

   isParentOf(node: Node): boolean | Promise<boolean>; /////////////////
   isAncestorOf(node: Node): boolean | Promise<boolean>; ///////////////
}

export type EvNode<S = any, P extends object = DefaultPorts> = {
   [portName in keyof P]: LocalPort<P[portName]>;
} &
   LocalNode<S, P>;

export interface RemoteNode extends Node {
   readonly type: ElementType.RemoteNode;
   run(data: any, controlData?: NodeControlData): Promise<void>;
}

// export interface RemoteSubnet extends RemoteNode {
//    readonly isSubnet: true;
// }

export interface UnknownNode extends NodeLike {
   readonly type: ElementType.UnknownNode;
}

export interface VirtualNode extends NodeLike {
   readonly type: ElementType.VirtualNode;
   readonly brand: string;
   readonly ports: PortSet<VirtualPort>;
}

export const enum VirtualNodeActionTypes {
   PipeAction,
}

export type VirtualNodeAction = {
   type: VirtualNodeActionTypes.PipeAction;
   from: Port | VirtualPort;
   to: Port | VirtualPort;
};

export type NodeOnRun = (console: NodeConsole) => void;

export const enum NodeRunningStage {
   NodeWillRun,
   NodeIsRunning,
   NodeDidRun,
}

export interface NodeError {
   node: Node;
   error: Error;
   stage: NodeRunningStage;
   data: any;
   controlData: NodeControlData;
}

export interface NodeControlData {
   port?: Port;
}

export interface NodeConsole {
   _nodeConsoleBrand: any;
   ///////////////////////////
}

export const enum NodeEvents {
   NodeWillRunEvent,
   NodeDidRunEvent,
   NodeWillOutputEvent,
   NodeWillPipeEvent,
   NodeDidPipeEvent,
   NodeDidUnpipeEvent,
   ErrorEvent,
}

export const enum NodeEventPriority {
   SystemHigh,
   High,
   Normal,
   Low,
   SystemLow,
}

export interface NodeWillRunControlObject {
   data: any;
   readonly controlData: Readonly<NodeControlData>;
   preventRunning: boolean;
}

export type NodeWillRunEventHandler = (
   thisNode: LocalNode,
   control: NodeWillRunControlObject,
) => void | Promise<void>;

export interface NodeDidRunControlObject {
   readonly data: any;
   readonly controlData: Readonly<NodeControlData>;
}

export type NodeDidRunEventHandler = (
   thisNode: Node,
   control: NodeDidRunControlObject,
) => void | Promise<void>;

export type NodeWillPipeEventHandler = (
   thisNode: LocalNode,
   thisPort: LocalPort,
   targetNode: Node,
   targetPort: Port,
   thisPortDirection: PortIORole.In | PortIORole.Out,
) => boolean;

export type NodeDidPipeEventHandler = (
   thisNode: LocalNode,
   thisPort: LocalPort,
   targetNode: Node,
   targetPort: Port,
   thisPortDirection: PortIORole.In | PortIORole.Out,
) => void;

export type NodeDidUnpipeEventHandler = (
   thisNode: LocalNode,
   thisPort: LocalPort,
   targetNode: Node,
   targetPort: Port,
   thisPortDirection: PortIORole.In | PortIORole.Out,
) => void;

export interface PortLike {
   readonly type:
      | ElementType.LocalPort
      | ElementType.RemotePort
      | ElementType.VirtualPort;

   readonly name: string;
   readonly node: Node | VirtualNode;
}

export interface Port<T = any> extends PortLike {
   readonly type: ElementType.LocalPort | ElementType.RemotePort;
   readonly name: string;
   readonly node: Node;
   readonly isInner: boolean;

   direction: PortIORole;
   readonly ioType: PortIORole;

   toString(): string;

   put(data: T): void;

   pipe<U extends LocalNode<any, { $I: T }>>(node: U): U;
   pipe(node: RemoteNode): RemoteNode;
   pipe(port: Port<T>): void;
   pipe<U extends VirtualNode>(node: U): U;
   pipe(port: VirtualPort): void;

   /*@internal*/
   _beRequestedPipe(
      port: Port,
      myIOType: PortIORole.In | PortIORole.Out,
   ): boolean | Promise<boolean>;

   alsoPipe(node: LocalNode<any, { $I: T }>): this;
   alsoPipe(node: RemoteNode): this;
   alsoPipe(port: Port<T>): this;
   alsoPipe(node: VirtualNode): this;
   alsoPipe(port: VirtualPort): this;

   unpipe(node: Node): this;
   unpipe(port: Port): this;

   /*@internal*/
   _notifyUnpipe(port: Port): void;
}

export const enum PortIORole {
   // Determine the values to 0, 1 and 2 for
   // bit operation and array accessing.
   Out = 0,
   In = 1,
   Undetermined = 2,
}

export interface DefaultPorts<I = any, O = any> {
   $I: I;
   $O: O;
   $E: NodeError;
   [port: string]: any;
}

export type Has$I = { $I: any };
export type PickTypeOf$I<P> = P extends Has$I ? P['$I'] : any;
export type Has$O = { $O: any };
export type PickTypeOf$O<P> = P extends Has$O ? P['$O'] : any;
