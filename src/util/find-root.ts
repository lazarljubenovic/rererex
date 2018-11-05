import fs from 'fs'
import path from 'path'
import util from 'util'

async function hasDir (parent: string, child: string): Promise<boolean> {
  const allChildren = await util.promisify(fs.readdir)(parent)
  for (const aChild of allChildren) {
    if (aChild != child) continue
    const stat = await util.promisify(fs.lstat)(aChild)
    if (stat.isDirectory()) return true
  }
  return false
}

export default async function findRoot (dirname: string): Promise<string | undefined> {
  let currentDir = dirname
  let i = 100
  while (true) {
    const hasNodeModules = await hasDir(currentDir, 'node_modules')
    if (hasNodeModules) return currentDir
    if (--i < 0) throw new Error('Infinite loop! Blame the dumb developer.')
    currentDir = path.join(currentDir, '..')
    if (currentDir == '/') return undefined
  }
}
