import type { Dictionary } from 'core/utility-types';

export type {
   Dictionary,
   Has$I,
   PickTypeOf$I,
   Has$O,
   PickTypeOf$O,
} from 'core/utility-types';

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

   /** Domain ID, used to uniquely identify a domain among interconnected domains. */
   readonly id: string;

   /** Every time the program re-runs, `randomRunId` is assigned a new random number. */
   readonly randomRunId: string;

   /** Is this a local domain? */
   readonly isLocal: boolean;
}

import type { LocalDomain } from 'core/local-domain';
import type { RemoteDomain } from 'core/remote-domain';
export type { LocalDomain, RemoteDomain };

export interface Group {
   readonly type: ElementType.LocalGroup | ElementType.RemoteGroup;
   readonly domain: Domain;
}

import type { LocalGroup } from 'core/local-group';
import type { RemoteGroup } from 'core/remote-group';
export type { LocalGroup, RemoteGroup };

export type NodeLikeType =
   | ElementType.LocalNode
   | ElementType.RemoteNode
   | ElementType.VirtualNode
   | ElementType.UnknownNode;

export interface NodeLike {
   readonly type: NodeLikeType;
}

export interface Node extends NodeLike {
   /* Constants */

   readonly type: ElementType.LocalNode | ElementType.RemoteNode;

   /** The domain this node belongs. */
   readonly domain: LocalDomain | RemoteDomain;

   readonly group:
      | (LocalGroup[] | undefined) // (LocalNode) The groups this node is in.
      | (LocalGroup | RemoteGroup); // (RemoteNode) The group this node is from.

   readonly uid: number;
   readonly brand: string;
   readonly isSubnet: boolean;

   /* Variables */

   // prettier-ignore
   readonly parent:
      | Node
      | UnknownNode  // has parent, but the parent does not belong to any known domains
      | undefined    // should have parent, but is undefined at this moment
      | null         // has no parent, because this node is a top-level node
      | "deny"       // access denied
      ;
   readParent(): Promise<Node | UnknownNode | undefined | null> | 'deny';

   state: any | /* access denied */ 'deny';
   readState(
      path?: string | string[] | Dictionary<string>,
   ): Promise<any> | 'deny';

   readonly portsState: NodePortsState | /* access denied */ 'deny';
   readPortsState(): Promise<NodePortsState> | 'deny';

   /* IO */

   run(data?: any, controlInfo?: NodeControlInfo): void | Promise<void>;

   /* Net structure */

   readonly ports: PortSet<Port>;

   pipe<U extends Node | VirtualNode>(node: U): U;
   pipe(port: Port | VirtualPort): void;

   alsoPipe(nodeOrPort: Node | VirtualNode | Port | VirtualPort): this;

   unpipe(nodeOrPort: Node | Port): this;

   isChildOf(node: Subnet): 'deny' | boolean | Promise<'deny' | boolean>;
   isDescendantOf(node: Subnet): 'deny' | boolean | Promise<'deny' | boolean>;

   /* Events */
   // eslint-disable-next-line @typescript-eslint/ban-types
   on(event: string | NodeEventType, handler: Function, options?: any): void;

   /*@internal*/
   _emit(event: NodeEventType, args: any[]): any;

   /* Other */
   toString(): string;
}

export interface Subnet extends Node {
   readonly isSubnet: true;
   readonly innerPorts: PortSet<Port>;
   readonly children: Set<Node>;
}

export type EvNode<S = any, P extends object = DefaultPorts> = LocalNode<S, P> &
   {
      [portName in keyof P]: LocalPort<P[portName]>;
   };

import type { LocalNode } from 'core/local-node';
import type { RemoteNode } from 'core/remote-node';
export type { LocalNode, RemoteNode };

export interface VirtualNode extends NodeLike {
   readonly type: ElementType.VirtualNode;
   readonly brand: string;
   readonly ports: PortSet<VirtualPort>;
}

export const enum VirtualNodeActionType {
   Pipe,
   AddEventHandler,
   Input,
}

export interface UnknownNode extends NodeLike {
   readonly type: ElementType.UnknownNode;
}

export type NodePortsState = Partial<
   Dictionary<{
      direction: PortIORole.In | PortIORole.Out;
      outerLinkNum: number;
      /** = 0, if node is not a subnet. */
      innerLinkNum: number;
   }>
>;

export type NodeOnRun<P extends object> = (console: NodeConsole<P>) => void;

export type NodeConsole<P extends object> = {
   _nodeConsoleBrand: any;
   ///////////////////////////
};

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
   controlInfo: NodeControlInfo;
}

export interface NodeControlInfo {
   port?: Port;
}

export const enum NodeEventType {
   NodeWillPipe,
   NodeDidPipe,
   NodeDidUnpipe,
   NodeWillRun,
   NodeDidRun,
   NodeWillOutput,
   NodePortsStateChange,
   NodeWillBecomeChild,
   NodeDidBecomeChild,
   NodeGoesLive,
   NodeGoesOffline,
   NodeStateChange,
}

// prettier-ignore
export const enum NodeEventPriority {
   SystemLow = 0,       //  0- 4
   Low = 5,             //  5- 9
   BelowNormal = 10,    // 10-14
   Normal = 15,         // 15
   AboveNormal = 16,    // 16-20
   High = 21,           // 21-25
   SystemHigh = 26,     // 26-31
}

export interface NodeEventHandler {
   fromAttr?: Attr;
   priority?: number;
}

export interface NodeWillRunHandler extends NodeEventHandler {
   (
      thisNode: LocalNode,
      controlObject: NodeWillRunControlObject,
   ): void | /* time delayer */ Promise<void>;
}

export interface NodeWillRunControlObject {
   data: any;
   readonly controlInfo: Readonly<NodeControlInfo>;
   preventRunning: boolean;
}

// prettier-ignore
export interface NodeDidRunEventHandler extends NodeEventHandler {
   (
      thisNode: Node,
      controlObject: NodeDidRunControlObject
   ): void | /* time delayer */ Promise<void>;
}

export interface NodeDidRunControlObject {
   readonly data: any;
   readonly controlInfo: Readonly<NodeControlInfo>;
}

export interface NodeWillPipeEventHandler extends NodeEventHandler {
   (
      thisNode: LocalNode,
      thisPort: LocalPort,
      targetNode: Node,
      targetPort: Port,
      thisPortDirection: PortIORole.In | PortIORole.Out,
      thisPortIsInner: boolean,
   ): /* should pipe? */ boolean;
}

export interface NodeDidPipeEventHandler extends NodeEventHandler {
   (
      thisNode: LocalNode,
      thisPort: LocalPort,
      targetNode: Node,
      targetPort: Port,
      thisPortDirection: PortIORole.In | PortIORole.Out,
      thisPortIsInner: boolean,
   ): void;
}

export interface NodeDidUnpipeEventHandler extends NodeEventHandler {
   (
      thisNode: LocalNode,
      thisPort: LocalPort,
      targetNode: Node,
      targetPort: Port,
      thisPortDirection: PortIORole.In | PortIORole.Out,
      thisPortIsInner: boolean,
   ): void;
}

// prettier-ignore
export interface NodeErrorEvent extends NodeEventHandler {
   (
      thisNode: LocalNode,
      isFromChild: boolean,
      nodeError: NodeError,
   ): /* error is caught? */ boolean | void;
}

import type { PortSet } from 'core/port-set';
export type { PortSet };

export interface PortLike {
   readonly type:
      | ElementType.LocalPort
      | ElementType.RemotePort
      | ElementType.VirtualPort;

   readonly name: string;
   readonly node: Node | VirtualNode;
}

export interface Port extends PortLike {
   readonly type: ElementType.LocalPort | ElementType.RemotePort;
   readonly name: string;
   readonly node: Node;

   readonly isInner: boolean;

   readonly direction: PortIORole;
   readonly ioType: PortIORole;

   toString(): string;

   put(data: any): void;

   pipe<U extends Node | VirtualNode>(node: U): U;
   pipe(port: Port | VirtualPort): void;

   /*@internal*/
   _beRequestedPipe(
      port: Port,
      myIOType: PortIORole.In | PortIORole.Out,
   ): boolean | Promise<boolean>;

   alsoPipe(nodeOrPort: Node | VirtualNode | Port | VirtualPort): this;
   unpipe(nodeOrPort: Node | Port): this;

   /*@internal*/
   _notifyUnpipe(port: Port): void;
}

import type { LocalPort } from 'core/local-port';
import type { RemotePort } from 'core/remote-port';
import type { VirtualPort } from 'core/virtual-port';
export type { LocalPort, RemotePort, VirtualPort };

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
