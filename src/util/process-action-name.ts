function throwInvalidActionName () {
  throw new Error(`The action name must be in form "store/name".`)
}

export default function processActionName (string: string): { store: string, actionName: string } {
  if (!string.includes('/')) {
    throwInvalidActionName()
  }
  const [store, actionName] = string.split('/')
  if (store == null || store.length == 1 || actionName == null || actionName.length == 1) {
    throwInvalidActionName()
  }
  return { store, actionName }
}
