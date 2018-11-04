#!/usr/bin/env node

import path from 'path'
import * as util from './util'
import * as generate from './generate'
import * as remove from './remove'
import { Project, PropertyAccessExpression, QuoteKind, IndentationText } from 'ts-simple-ast'


function createProject (root: string) {
  const project = new Project({
    tsConfigFilePath: path.join(root, 'tsconfig.json'),
  })
  project.manipulationSettings.set({
    quoteKind: QuoteKind.Single,
    indentationText: IndentationText.TwoSpaces,
  })
  return project
}

async function main () {
  const args = process.argv.slice(2)
  const root = await util.findRoot(process.cwd())
  const project = createProject(root)

  if (args.length == 0) {
    console.error(`Tell me what to do!`)
    process.exit(1)
  }

  if (args[0] == 'g' || args[0] == 'generate') {

    if (args.length == 1) {
      console.error(`Tell me what to generate: [s]tore, [a]ction.`)
      process.exit(1)
    }

    if (args[1] == 's' || args[1] == 'store') {

      if (args.length == 2) {
        console.error(`Tell me the store's name.`)
        process.exit(1)
      }

      const storeName = args[2]

      try {
        await generate.store(root, storeName, project)
      } catch (e) {
        console.error(e)
        process.exit(1)
      }

      process.exit(0)

    }

    if (args[1] == 'a' || args[1] == 'action') {

      if (args.length == 2) {
        console.error(`Tell me the name of the action, like "scope/name".`)
        process.exit(1)
      }

      const actionName = args[2]

      try {
        await generate.action(root, actionName, project)
      } catch (e) {
        console.error(e)
        process.exit(1)
      }

      process.exit(0)

    }

  }

  if (args[0] == 'rm' || args[0] == 'remove') {

    if (args.length == 1) {
      console.error(`Tell me what to remove: [a]ction.`)
      process.exit(1)
    }

    if (args[1] == 'a' || args[1] == 'action') {

      if (args.length == 2) {
        console.error(`Tell me which action to remove, like "scope/name".`)
        process.exit(1)
      }

      const actionName = args[2]

      try {
        await remove.action(root, actionName, project)
      } catch (e) {
        console.error(e)
        process.exit(1)
      }

      process.exit(0)

    }

  }

  console.error(`I have no idea what you wanna do.`)
  process.exit(1)
}

main()
