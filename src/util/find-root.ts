import fs from 'fs'
import path from 'path'

async function hasDir (parent: string, child: string): Promise<boolean> {
  const allChildren = await fs.promises.readdir(parent)
  for (const aChild of allChildren) {
    if (aChild != child) continue
    const stat = await fs.promises.lstat(aChild)
    if (stat.isDirectory()) return true
  }
  return false
}

export default async function findRoot (dirname: string): Promise<string> {
  let currentDir = dirname
  let i = 100
  while (true) {
    const hasNodeModules = await hasDir(currentDir, 'node_modules')
    if (hasNodeModules) return currentDir
    if (--i < 0) throw new Error('Infinite loop! Blame the dumb developer.')
    currentDir = path.join(currentDir, '..')
  }
}
