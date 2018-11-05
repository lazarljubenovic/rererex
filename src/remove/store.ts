import Project, {SourceFile, SyntaxKind, TypeGuards} from 'ts-simple-ast'
import path from 'path'
import util from 'util'
import fs from 'fs'

function handleReducerFile (file: SourceFile, store: string) {
  // Remove import
  const importDeclaration = file.getImportDeclarationOrThrow(`./${store}/reducer`)
  importDeclaration.remove()

  // Remove from combineReducers's argument
  const callExpression = file.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression)
  const args = callExpression.getArguments()
  if (args.length != 1) throw new Error(`Expected exactly one argument of combineReducers function.`)
  const arg = args[0]
  if (!TypeGuards.isObjectLiteralExpression(arg)) throw new Error(`Expected the argument of combineReducers to be an object literal expression.`)
  arg.getPropertyOrThrow(store).remove()
}

function handleStateFile (file: SourceFile, store: string) {
  file.getImportDeclarationOrThrow(`./${store}/state`).remove()
  file.getInterfaceOrThrow('State').getPropertyOrThrow(store).remove()
}

function handleIndexFile (file: SourceFile, store: string) {
  file.getImportDeclarationOrThrow(`./${store}`).remove()
  file.getExportDeclarationOrThrow(() => true).getNamedExports()
    .filter(namedExport => namedExport.getName() == store)
    .forEach(namedExport => namedExport.remove())
}

export default async function removeStore (root: string, store: string, project: Project) {
  const storeDirPath = path.join(root, 'src', 'store', store)
  const storeDir = project.getDirectoryOrThrow(storeDirPath)

  const [reducerFile, stateFile, indexFile] = ['reducer', 'state', 'index'].map(name => {
    return project.getSourceFileOrThrow(path.join(root, 'src', 'store', `${name}.ts`))
  })

  handleReducerFile(reducerFile, store)
  handleStateFile(stateFile, store)
  handleIndexFile(indexFile, store)

  storeDir.getSourceFiles().forEach(file => file.delete())
  await project.save()
  await util.promisify(fs.rmdir)(storeDirPath)

  console.log('Done!')
}
