import Project from 'ts-simple-ast'
import path from 'path'
import * as util from '../util'

export default async function renameAction (root: string, action: string, newName: string, project: Project) {
  const { store, actionName } = util.processActionName(action)
  const storeDirPath = path.join(root, 'src', 'store', store)

  const actionTypeFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'action-type.ts'))
  const member = actionTypeFile.getEnumOrThrow('ActionType').getMemberOrThrow(actionName)
  member.rename(newName)
  member.setValue(`${store}/${newName}`)

  const actionsFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'actions.ts'))
  const declaration = actionsFile.getVariableDeclarationOrThrow(actionName)
  declaration.rename(newName)

  await actionTypeFile.save()
  await actionsFile.save()
  await project.save()

  console.log('Done!')
}