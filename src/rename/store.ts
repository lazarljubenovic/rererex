import Project, {SourceFile, SyntaxKind, TypeGuards} from 'ts-simple-ast'
import path from 'path'
import * as casing from 'change-case'

function handleReducerFile (file: SourceFile, store: string, newName: string) {
  file.getImportDeclarationOrThrow(`./${ newName }/reducer`).renameDefaultImport(newName)

  // ts-simple-ast handles this but it's actually a bug, although it works in our favor.
  // when the bug is fixed, uncomment the lines below.

  // when renaming a prop from "a" to "b", it transforms { a } into  { b }, while correct behavior
  // would be { a: b }.

  // const callExpression = file.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression)
  // const args = callExpression.getArguments()
  // if (args.length != 1) throw new Error(`Expected exactly one argument of combineReducers function.`)
  // const arg = args[0]
  // if (!TypeGuards.isObjectLiteralExpression(arg)) throw new Error(`Expected the argument of combineReducers to be an object literal expression.`)
  // arg.getPropertyOrThrow(store).replaceWithText(newName)
}

function handleStateFile (file: SourceFile, store: string, newName: string) {
  file.getImportDeclarationOrThrow(`./${ newName }/state`).renameDefaultImport(casing.pascal(newName))
  file.getInterfaceOrThrow('State').getPropertyOrThrow(casing.camel(store)).set({
    name: casing.camel(newName),
    type: casing.pascal(newName),
  })
}

function handleIndexFile (file: SourceFile, store: string, newName: string) {
  file.getImportDeclarationOrThrow(`./${ newName }`).remove()
  file.addImportDeclaration({
    moduleSpecifier: `./${ casing.param(newName) }`,
    namespaceImport: casing.camel(newName),
  })

  file.getExportDeclarationOrThrow(() => true).getNamedExports()
    .filter(namedExport => namedExport.getName() == casing.camel(store))
    .forEach(namedExport => namedExport.replaceWithText(casing.camel(newName)))
}

export default async function renameStore (root: string, store: string, newName: string, project: Project) {
  const storeDirPath = path.join(root, 'src', 'store', store)
  const storeDir = project.getDirectoryOrThrow(storeDirPath)
  storeDir.move(path.join(root, 'src', 'store', `${ casing.param(newName) }`))

  const [reducerFile, stateFile, indexFile] = ['reducer', 'state', 'index'].map(name => {
    return project.getSourceFileOrThrow(path.join(root, 'src', 'store', `${ name }.ts`))
  })

  handleReducerFile(reducerFile, store, newName)
  console.log('reducer ok')
  handleStateFile(stateFile, store, newName)
  console.log('staet ok')
  handleIndexFile(indexFile, store, newName)
  console.log('index ok')

  await project.save()
  console.log(`Done!`)
}