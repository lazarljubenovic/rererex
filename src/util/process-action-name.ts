function throwInvalidActionName () {
  throw new Error(`The action name must be in form "store/name".`)
}

export default function processActionName (string: string): { store: string, actionName: string } {
  if (!string.includes('/')) {
    throwInvalidActionName()
  }
  const [store, actionName] = string.split('/')
  if (store == null || store.length == 0 || actionName == null || actionName.length == 0) {
    throwInvalidActionName()
  }
  return { store, actionName }
}
