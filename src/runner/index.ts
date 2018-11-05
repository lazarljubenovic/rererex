import * as tags from "common-tags"
import {IndentationText, Project, QuoteKind} from 'ts-simple-ast'
import path from "path"
import {isLeafNode, isNode, LeafNode, Tree, Node} from './tree'
import * as util from '../util'

function getDesiredNode (args: string[], tree: Tree): LeafNode {
  const root: Node = {
    command: [''],
    errorMessage: `Tell me what to do`,
    children: tree,
  }
  const argsLeft: string[] = [...args]
  let currentNode: Node = root
  while (argsLeft.length > 0) {
    const currentArg = argsLeft.shift()
    const matchedNode = currentNode.children
      .find(node => node.command == null || node.command.some(c => c == currentArg))
    if (matchedNode == null) throw new Error(`Cannot parse command.`)
    if (isLeafNode(matchedNode)) return matchedNode
    currentNode = matchedNode
  }

  console.error(currentNode.errorMessage)

  const possibleChildren = currentNode.children.filter(isNode)
  if (possibleChildren.length > 0) {
    console.error(`I can do one of the following:`)
    possibleChildren.forEach(node => {
      console.error(tags.commaLists` - ${ node.command }`)
    })
  }

  throw new Error(`Incomplete command.`)
}

function createProject (root: string): Project {
  const project = new Project({
    tsConfigFilePath: path.join(root, 'tsconfig.json'),
  })
  project.manipulationSettings.set({
    quoteKind: QuoteKind.Single,
    indentationText: IndentationText.TwoSpaces,
  })
  return project
}

export async function main (args: string[], tree: Tree) {
  try {
    const desiredNode = getDesiredNode(args, tree)
    const rootOrUndefined = await util.findRoot(process.cwd())
    const root = rootOrUndefined == null ? process.cwd() : rootOrUndefined
    await desiredNode.run(args, root, createProject(root))
  } catch (e) {
    if (e instanceof Error) {
      console.error(`FAILED: ${ e.message }`)
      process.exit(1)
    }
    throw e
  }
}


