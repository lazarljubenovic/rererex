import Project, { ImportDeclarationStructure } from 'ts-simple-ast'
import path from 'path'
import casing from 'change-case'

export async function create (root: string, dirPath: string[], project: Project) {
  project.createSourceFile(path.join(root, ...dirPath, 'index.ts'), `export { }`)
}

export async function insert (root: string,
                              dirPath: string[],
                              name: string,
                              { isDefaultImport = false, isNamespaceImport = false },
                              project: Project,
                              mapName: (name: string) => string = name => name) {

  if (!isDefaultImport && !isNamespaceImport) {
    throw new Error(`Set either isDefaultImport or isNamespaceImport.`)
  }

  if (isDefaultImport && isNamespaceImport) {
    throw new Error(`Cannot be both isDefaultImport and isNamespaceImport.`)
  }

  const filePath = path.join(root, ...dirPath, 'index.ts')
  const file = project.getSourceFileOrThrow(filePath)

  // Add import

  const importStructure: ImportDeclarationStructure = {
    moduleSpecifier: `./${casing.param(name)}`,
  }

  if (isDefaultImport) {
    importStructure.defaultImport = mapName(name)
  }
  if (isNamespaceImport) {
    importStructure.namespaceImport = mapName(name)
  }

  file.addImportDeclaration(importStructure)

  // Add export

  const exportDeclaration = file.getExportDeclarationOrThrow(() => true)
  exportDeclaration.addNamedExport(mapName(name))

}

export async function upsert (root: string,
                              dirPath: string[],
                              name: string,
                              { isDefaultImport = false, isNamespaceImport = false },
                              project: Project,
                              mapName: (name: string) => string = name => name) {

  const file = project.getSourceFile(path.join(root, ...dirPath, 'index.ts'))

  if (file == null) {
    await create(root, dirPath, project)
  }

  await insert(root, dirPath, name, { isDefaultImport, isNamespaceImport }, project, mapName)

}
