#!/usr/bin/env node

import * as generate from './generate'
import * as remove from './remove'
import * as rename from './rename'
import * as bootstrap from './bootstrap'
import {Tree} from './runner/tree'
import {main} from './runner'

const tree: Tree = [
  {
    command: ['bootstrap', 'b'],
    errorMessage: `Tell me the name of the app.`,
    children: [
      {
        command: null,
        run: async ([_, name]) => {
          await bootstrap.app(process.cwd(), name)
        },
      },
    ],
  },
  {
    command: ['generate', 'g', 'create', 'c', 'add', 'a'],
    errorMessage: `Tell me what to generate.`,
    children: [
      {
        command: ['store', 'state', 's'],
        errorMessage: `Tell me the name of the store.`,
        children: [
          {
            command: null,
            run: async ([_, __, name], root, project) => {
              await generate.store(root, name, project)
            },
          },
        ],
      },
      {
        command: ['action', 'a'],
        errorMessage: `Tell me the name of the action in form [store]/[action].`,
        children: [
          {
            command: null,
            run: async ([_, __, name], root, project) => {
              await generate.action(root, name, project)
            },
          },
        ],
      },
      {
        command: ['page', 'p'],
        errorMessage: `Tell me the path and name of the page you want to create.`,
        children: [
          {
            command: null,
            run: async ([_, __, name], root, project) => {
              await generate.page(root, name, project)
            }
          }
        ]
      }
    ],
  },
  {
    command: ['remove', 'rm'],
    errorMessage: `Tell me what to remove.`,
    children: [
      {
        command: ['action', 'a'],
        errorMessage: `Tell me the name of the action you want to remove.`,
        children: [
          {
            command: null,
            run: async ([_, __, name], root, project) => {
              await remove.action(root, name, project)
            },
          },
        ],
      },
      {
        command: ['store', 'state', 's'],
        errorMessage: `Tell me the name of the store you want to remove.`,
        children: [
          {
            command: null,
            run: async ([_, __, name], root, project) => {
              await remove.store(root, name, project)
            },
          },
        ],
      },
    ],
  },
  {
    command: ['rename'],
    errorMessage: `Tell me what to rename.`,
    children: [
      {
        command: ['action', 'a'],
        errorMessage: `Tell me the name of the action you want to rename.`,
        children: [
          {
            command: null,
            run: async ([_, __, name, newName], root, project) => {
              await rename.action(root, name, newName, project)
            },
          },
        ],
      },
      {
        command: ['store', 'state', 's'],
        errorMessage: `Tell me the name of the store you want to rename.`,
        children: [
          {
            command: null,
            run: async ([_, __, name, newName], root, project) => {
              await rename.store(root, name, newName, project)
            }
          }
        ]
      }
    ],
  },
]

const args = process.argv.slice(2)
main(args, tree)
