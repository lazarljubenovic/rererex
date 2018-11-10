import path from 'path'

export function api (root: string) {
  return path.join(root, 'src', 'api')
}

export function components (root: string) {
  return path.join(root, 'src', 'components')
}

export function store (root: string) {
  return path.join(root, 'src', 'store')
}

export function serverErrors (root: string) {
  return path.join(root, 'src', 'server-errors')
}

export function pages (root: string) {
  return path.join(root, 'src', 'pages')
}

export function createAction (root: string) {
  return path.join(root, 'src', 'create-action')
}

export function utils (root: string) {
  return path.join(root, 'src', 'utils')
}

/**
 * Pass in the root of the project and a directory where the "from" file is placed.
 * You'll get back a function "fn" which you can give in a function from this folder.
 *
 * @example
 * const pathTo = createPathTo(root, currentFolder)
 * const relativePathToApi = pathTo(paths.api)
 *
 * @param {string} root Root of the project.
 * @param {string} fromDir The directory where the "from" file is placed.
 * @returns {(getByRoot: (root: string) => string) => string}
 */
export function createPathTo (root: string, fromDir: string) {
  return (getByRoot: (root: string) => string) => path.relative(fromDir, getByRoot(root))
}
