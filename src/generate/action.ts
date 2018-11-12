import Project, { SyntaxKind, SyntaxList } from 'ts-simple-ast'
import path from 'path'
import * as tags from 'common-tags'
import * as util from '../util'
import * as casing from 'change-case'

export default async function generateAction (root: string, action: string, project: Project) {

  const { store, actionNames } = util.processActionName(action)

  const storeDirPath = path.join(root, 'src', 'store', casing.param(store))

  for (const actionName of actionNames) {
    const actionTypeFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'action-type.ts'))
    actionTypeFile.getEnumOrThrow('ActionType').addMember({
      name: casing.camel(actionName),
      value: `${ casing.camel(store) }/${ casing.camel(actionName) }`,
    })

    const actionsFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'actions.ts'))
    actionsFile.addStatements(
      tags.oneLine`export const ${ casing.camel(actionName) } =
      () => createAction(ActionType.${ casing.camel(actionName) })`,
    )

    const reducerFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'reducer.ts'))
    const caseBlock = reducerFile.getFirstDescendantByKindOrThrow(SyntaxKind.CaseBlock)
    const syntaxList = caseBlock.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList) as SyntaxList
    const indent = syntaxList.getIndentationLevel()
    const text = tags.stripIndent`
    case ActionType.${ casing.camel(actionName) }:
      return {
        ...state,
      }
  `
    syntaxList.insertChildText(syntaxList.getChildCount() - 1, util.indent(text, indent))

  }

  await project.save()
  console.log('Done!')

}
