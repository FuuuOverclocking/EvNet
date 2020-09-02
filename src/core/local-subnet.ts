import type { DefaultPorts as DP, Subnet, Node } from 'core/types';
import { LocalNode } from 'core/local-node';
import { LocalPort } from 'core/port';
import { PortSet } from 'core/portset';

export class LocalSubnet<S = any, P extends object = DP>
   extends LocalNode<S, P>
   implements Subnet {
   public readonly isSubnet: true = true;
   public readonly innerPorts: PortSet<LocalPort> = new PortSet<LocalPort>(
      LocalPort,
      true,
      this,
   );
   public readonly children: Set<Node> = new Set();

   public isParentOf(node: Node): boolean {
      /////////////////////
      return true;
   }
   public isAncestorOf(node: Node): boolean {
      /////////////////////
      return true;
   }
}
