import Project, { SyntaxKind, SwitchStatement, SyntaxList } from "ts-simple-ast"
import path from 'path'
import { stripIndent } from "common-tags"
import * as util from '../util'


export default async function generateAction (root: string, action: string, project: Project) {

  const { store, actionName } = util.processActionName(action)

  const storeDirPath = path.join(root, 'src', 'store', store)

  const actionTypeFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'action-type.ts'))
  actionTypeFile.getEnumOrThrow('ActionType').addMember({
    name: actionName,
    value: `${store}/${actionName}`
  })

  const actionsFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'actions.ts'))
  actionsFile.addStatements(`export const ${actionName} = () => createAction(ActionType.${actionName})`)

  const reducerFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'reducer.ts'))
  const caseBlock = reducerFile.getFirstDescendantByKindOrThrow(SyntaxKind.CaseBlock)
  const syntaxList = caseBlock.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList) as SyntaxList
  const indent = syntaxList.getIndentationLevel()
  const text = stripIndent`
    case ActionType.${actionName}:
      return {
        ...state,
      }
  `
  syntaxList.insertChildText(syntaxList.getChildCount() - 1, util.indent(text, indent))
  
  const files = [actionTypeFile, actionsFile, reducerFile]
  const promises = files.map(file => file.save())
  await Promise.all(promises)
  await project.save()

  console.log('Done!')

}
