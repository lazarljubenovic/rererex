import Project from 'ts-simple-ast'
import path from 'path'
import * as util from '../util'
import * as casing from 'change-case'

export default async function renameAction (root: string, action: string, newName: string, project: Project) {

  const { store, actionNames } = util.processActionName(action)
  if (actionNames.length > 1) {
    throw new Error(`You can only rename one action at a time.`)
  }
  const storeDirPath = path.join(root, 'src', 'store', casing.param(store))

  for (const actionName of actionNames) {

    const actionTypeFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'action-type.ts'))
    const member = actionTypeFile.getEnumOrThrow('ActionType').getMemberOrThrow(casing.camel(actionName))
    member.rename(casing.camel(newName))
    member.setValue(`${casing.camel(store)}/${newName}`)

    const actionsFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'actions.ts'))
    const declaration = actionsFile.getVariableDeclarationOrThrow(casing.camel(actionName))
    declaration.rename(casing.camel(newName))

  }

  await project.save()

  console.log('Done!')
}