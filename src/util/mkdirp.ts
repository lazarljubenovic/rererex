import Project from 'ts-simple-ast'
import path from 'path'

export default function mkdirp (project: Project, root: string, dirPath: string[]) {

  for (let i = 0; i < dirPath.length; i++) {
    const currentPath = path.join(root, ...dirPath.slice(0, i))
    const currentDir = project.getDirectory(currentPath)
    if (currentDir == null) {
      project.createDirectory(currentPath)
    }
  }

  return project.getDirectoryOrThrow(path.join(root, ...dirPath))

}
