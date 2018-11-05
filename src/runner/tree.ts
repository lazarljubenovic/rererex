import {Project} from 'ts-simple-ast'

export interface Node {
  command: Array<string>
  errorMessage: string
  children: Array<Node | LeafNode>
}

export interface LeafNode {
  command: null | Array<string>
  run: (commands: string[], root: string, project: Project) => Promise<any>
}

export type Tree = Node['children']

export function isLeafNode (node: Node | LeafNode): node is LeafNode {
  return (node as any).run != null
}

export function isNode (node: Node | LeafNode): node is Node {
  return (node as any).children != null
}