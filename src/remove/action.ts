import Project, {SyntaxKind, TypeGuards} from "ts-simple-ast"
import path from 'path'
import * as util from '../util'
import * as casing from 'change-case'

export default async function removeAction (root: string, action: string, project: Project) {
  const {store, actionName} = util.processActionName(action)

  const storeDirPath = path.join(root, 'src', 'store', casing.param(store))

  const actionTypeFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'action-type.ts'))
  const member = actionTypeFile.getEnumOrThrow('ActionType').getMemberOrThrow(casing.camel(actionName))
  member.remove()

  const actionsFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'actions.ts'))
  const declaration = actionsFile.getVariableDeclarationOrThrow(casing.camel(actionName))
  declaration.remove()

  const reducerFile = project.getSourceFileOrThrow(path.join(storeDirPath, 'reducer.ts'))
  const caseBlock = reducerFile.getFirstDescendantByKindOrThrow(SyntaxKind.CaseBlock)
  const clauses = caseBlock.getClauses()
  const index = clauses
    .findIndex(clause => {
      if (!TypeGuards.isCaseClause(clause)) return false
      const propAccessExpression = clause.getExpression()
      if (!TypeGuards.isPropertyAccessExpression(propAccessExpression)) return false
      const name = propAccessExpression.getName()
      return name == casing.camel(actionName)
    })
  caseBlock.removeClause(index)

  const files = [actionTypeFile, actionsFile, reducerFile]
  const promises = files.map(file => file.save())
  await Promise.all(promises)
  await project.save()

  console.log('Done!')
}
