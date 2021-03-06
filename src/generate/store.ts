import * as util from '../util'
import path from 'path'
import Project, { SyntaxKind, TypeGuards } from 'ts-simple-ast'
import { stripIndent } from 'common-tags'
import * as casing from 'change-case'

export default async function generateStore (dirname: string, name: string, project: Project) {
  const root = await util.findRoot(dirname)
  if (root == null) throw new Error(`Cannot find project root.`)

  const storeDirPath = path.join(util.paths.store(root), casing.param(name))
  const storeDir = project.createDirectory(storeDirPath)
  storeDir.saveSync()

  const pathTo = util.paths.createPathTo(root, storeDirPath)

  const actionTypeFile = project.createSourceFile(path.join(storeDirPath, 'action-type.ts'))
  actionTypeFile.insertText(0, stripIndent`
    enum ActionType {
      action1 = '${casing.camel(name)}/action1',
      action2 = '${casing.camel(name)}/action2',
    }
    
    export default ActionType
  `)

  const actionsFile = project.createSourceFile(path.join(storeDirPath, 'actions.ts'))
  actionsFile.insertText(0, stripIndent`
    import createAction from '${pathTo(util.paths.createAction)}'
    import ActionType from './action-type'
    
    export const action1 = () => createAction(ActionType.action1)
    export const action2 = () => createAction(ActionType.action2)
  `)

  const interfacesFile = project.createSourceFile(path.join(storeDirPath, 'interfaces.ts'))
  interfacesFile.insertText(0, '')

  const reducerFile = project.createSourceFile(path.join(storeDirPath, 'reducer.ts'))
  reducerFile.insertText(0, stripIndent`
    import { Reducer } from 'redux'
    import State, { initialState } from './state'
    import ActionType from './action-type'
    import * as utils from '${pathTo(util.paths.utils)}'

    type Action = GetActions<typeof import('./actions')>

    const reducer: Reducer<State, Action> = (state = initialState, action) => {
      switch (action.type) {
        case ActionType.action1:
          return {
            ...state,
          }
        case ActionType.action2:
          return {
            ...state,
          }
        default:
          utils.assertNever(action)
          return state
      }
    }

    export default reducer
  `)

  const stateFile = project.createSourceFile(path.join(storeDirPath, 'state.ts'))
  stateFile.insertText(0, stripIndent`
    interface Interface {
    }
    
    type State = Interface | null
    
    const initialState: State = null
    
    export default State
    export { initialState }
  `)

  const indexFile = project.createSourceFile(path.join(storeDirPath, 'index.ts'))
  indexFile.insertText(0, stripIndent`
    import * as actionTypes from './action-type'
    import * as actions from './actions'
    import * as reducer from './reducer'
    import * as state from './state'
    
    export {
      actionTypes,
      actions,
      reducer,
      state,
    }
  `)

  const storeIndexFile = project.getSourceFileOrThrow(path.join(storeDirPath, '..', 'index.ts'))
  // add import:
  storeIndexFile.addImportDeclaration({
    namespaceImport: casing.camel(name),
    moduleSpecifier: `./${casing.param(name)}`
  })
  // add export:
  const exportDeclaration = storeIndexFile.getExportDeclarationOrThrow(() => true)
  exportDeclaration.addNamedExport(casing.camel(name))

  const storeReducerFile = project.getSourceFileOrThrow(path.join(storeDirPath, '..', 'reducer.ts'))
  storeReducerFile.addImportDeclaration({
    defaultImport: casing.camel(name),
    moduleSpecifier: `./${casing.param(name)}/reducer`
  })
  const callExpressions = storeReducerFile.getDescendantsOfKind(SyntaxKind.CallExpression)
  const combineReducerCallExpression = callExpressions.find(expression => expression.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier).getText() == 'combineReducers')!
  const args = combineReducerCallExpression.getArguments()
  if (args.length != 1) throw new Error(`Expected exactly one argument of combineReducers function.`)
  const arg = args[0]
  if (!TypeGuards.isObjectLiteralExpression(arg)) throw new Error(`Expected the argument of combineReducers to be an object literal expression.`)
  arg.insertShorthandPropertyAssignment(arg.getProperties().length, {
    name: casing.camel(casing.camel(name)),
  })

  const storeStateFile = project.getSourceFileOrThrow(path.join(storeDirPath, '..', 'state.ts'))
  storeStateFile.addImportDeclaration({
    defaultImport: casing.pascal(name),
    moduleSpecifier: `./${casing.param(name)}/state`,
  })
  const stateInterface = storeStateFile.getInterfaceOrThrow('State')
  stateInterface.insertProperty(stateInterface.getProperties().length, {
    name: casing.camel(name),
    type: casing.pascal(name),
  })

  const allFiles = [actionTypeFile, actionsFile, interfacesFile, reducerFile, stateFile, indexFile, storeIndexFile, storeReducerFile]
  const promises = allFiles.map(file => {
    return file.save()
  })
  await Promise.all(promises)
  await project.save()

  console.log('Done!')

}
