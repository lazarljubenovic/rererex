import Project, {IndentationText, QuoteKind} from 'ts-simple-ast'
import os from 'os'
import path from 'path'
import childProcess from 'child_process'
import nodeUtil from 'util'
import casing from 'change-case'
import fs from 'fs'
import util from 'util'
import * as tag from 'common-tags'

const exec = nodeUtil.promisify(childProcess.exec)

const IS_WIN = os.platform().includes('win')
const WHERE = IS_WIN ? 'where' : 'whereis'

export async function runCommands (root: string, appName: string) {
  const cwd = casing.param(appName)
  await exec(`yarn create react-app ${ cwd } ---typescript`)

  const packages = [
    // router
    `react-router-dom`,
    // redux
    `redux`,
    `react-redux`,
    // more redux
    `redux-form`,
    // http
    `axios`,
    // styles
    `styled-components`,
    // additional
    `bind-decorator`,
  ]
  await exec(tag.inlineLists`yarn add ${ packages }`, {cwd})

  const typesPackages = [
    "react-redux",
    "react-router-dom",
    "redux-form",
    "styled-components",
  ].map(p => `@types/${ p }`)
  await exec(tag.inlineLists`yarn add -D ${ typesPackages }`, {cwd})
}

/**
 * We use styled-components for styles.
 */
export async function removeCss (root: string, project: Project) {
  // CRA generates App.css and index.css in /src/ folder.
  // Delete them.
  const cssFilePaths = ['App.css', 'index.css'].map(name => path.join(root, 'src', name))
  await Promise.all(cssFilePaths.map(path => util.promisify(fs.unlink)(path)))

  // Remove imports for those two files.
  const appFile = project.getSourceFileOrThrow(path.join(root, 'src', 'App.tsx'))
  appFile.getImportDeclarationOrThrow('./App.css').remove()

  const indexFile = project.getSourceFileOrThrow(path.join(root, 'src', 'index.tsx'))
  indexFile.getImportDeclarationOrThrow('./index.css').remove()

  await Promise.all([appFile.save(), indexFile.save()])
}

export async function prepareStore (root: string, project: Project) {
  const storeDir = project.createDirectory(path.join(root, 'src', 'store'))
  const indexFile = storeDir.createSourceFile('index.ts')
  const reducerFile = storeDir.createSourceFile('reducer.ts')
  const stateFile = storeDir.createSourceFile('state.ts')
  const files = [indexFile, reducerFile, stateFile]

  stateFile.insertText(0, tag.stripIndent`  
    export default interface State {
    }
  `)

  reducerFile.insertText(0, tag.stripIndent`
    import { combineReducers } from 'redux'
    import { reducer as form } from 'redux-form'
    
    export default combineReducers({
      form,
    })
  `)

  indexFile.insertText(0, tag.stripIndent`
    import { createStore } from 'redux'
    import reducer from './reducer'
    
    import State from './state'
    
    const store = createStore(reducer)
    export default store
    
    export {
      State,
    }
  `)

  await Promise.all(files.map(file => file.save()))
}

export async function prepareReduxHelpers (root: string, project: Project) {
  const createActionFile = project.createSourceFile(path.join(root, 'src', 'create-action.ts'))
  const utilsFile = project.createSourceFile(path.join(root, 'src', 'utils.ts'))
  const files = [createActionFile, utilsFile]

  createActionFile.insertText(0, tag.stripIndent`
    export interface ActionWithoutPayload<T extends string> {
      type: T
    }
    
    export interface ActionWithPayload<T extends string, P> extends ActionWithoutPayload<T> {
      payload: P
    }
    
    function createAction<T extends string> (type: T): ActionWithoutPayload<T>
    function createAction<T extends string, P> (type: T, payload: P): ActionWithPayload<T, P>
    function createAction<T extends string, P> (type: T, payload?: P) {
      return payload === undefined ? { type } : { type, payload }
    }
    
    export default createAction
  `)

  utilsFile.insertText(0, tag.stripIndent`
    export function assertNever (x: never): void {
      /* no you are empty */
    }
  `)

  await Promise.all(files.map(file => file.save()))

  await util.promisify(fs.writeFile)(path.join(root, 'additional.d.ts'), tag.stripIndent`
    type GetActions<T extends Record<string, (...args: any[]) => any>> = ReturnType<T[keyof T]>
  `)
}

export async function prepareStyledComponents (root: string, project: Project) {
  const styledComponentsFile = project.createSourceFile(path.join(root, 'src', 'styled-components.d.ts'), tag.stripIndent`
      import 'styled-components'

      declare module 'styled-components' {
        export interface DefaultTheme {
          
        }
      }  
  `)
  const files = [styledComponentsFile]
  await Promise.all(files.map(file => file.save()))
}

export async function prepareComponentsDir (root: string, project: Project) {
  const componentsDir = project.createDirectory(path.join(root, 'src', 'components'))
  const indexFile = componentsDir.createSourceFile('index.ts', tag.stripIndent`
    export {}
  `)
  await componentsDir.save()
  await indexFile.save()
}

export async function prepareHomePage (root: string, project: Project) {
  const pagesDir = project.createDirectory(path.join(root, 'src', 'pages'))
  const indexFile = pagesDir.createSourceFile('index.ts', tag.stripIndent`
    import * as Home from './Home'
    
    export {
      Home,
    }
  `)

  const homeDir = pagesDir.createDirectory('home')
  const homeIndexFile = homeDir.createSourceFile('index.ts', tag.stripIndent`
    import component from './component'

    export {
      component,
    }
  `)
  const homeComponentFile = homeDir.createSourceFile('component.tsx', tag.stripIndent`
    import * as React from 'react'
    import * as store from '../../store'
    import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
    import { compose } from 'redux'
    import * as cmps from '../../components'
    import bind from 'bind-decorator'
    
    interface StateProps {
    }
    
    interface DispatchProps {
    }
    
    interface OwnProps {
    }
    
    type Props = StateProps & DispatchProps & OwnProps
    
    interface State {
    }
    
    class Home extends React.Component<Props, State> {
    
      constructor (props: Props) {
        super(props)
      }
    
      public render () {
        return (
          <div className="Home">
            <h1>Home Page</h1>
          </div>
        )
      }
    
    }
    
    const mapStateToProps: MapStateToProps<StateProps, OwnProps, store.State> = (state, ownProps) => {
      return {}
    }
    
    const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch, ownProps) => {
      return {}
    }
    
    export default compose(
      connect(mapStateToProps, mapDispatchToProps),
    )(Home)  
  `)

  const files = [indexFile, homeComponentFile, homeIndexFile]
  await Promise.all(files.map(file => file.save()))
}

export async function setUpApp (root: string, project: Project) {
  const app = project.getSourceFileOrThrow(path.join(root, 'src', 'App.tsx'))
  app.replaceText([0, app.getFullText().length], tag.stripIndent`
    import * as React from 'react'
    import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
    import * as pages from './pages'
    import { Provider } from 'react-redux'
    import store from './store'
    import {createGlobalStyle} from 'styled-components'
    
    const GlobalStyle = createGlobalStyle\`
      * {
    
        &,
        &::after,
        &::before {
          box-sizing: border-box;
        }
      }
    
      input, button {
        font: inherit;
      }
    
      body {
        font-family: sans-serif;
        font-size: 120%;
        margin-left: auto;
        margin-right: auto;
        max-width: 60rem;
        width: calc(100% - 4rem);
      }
    \`
    
    class App extends React.Component {
      public render () {
        return (
          <Provider store={ store }>
            <Router>
              <div>
                <GlobalStyle/>
                <Switch>
                  <Route path="/" exact component={ pages.Home.component }/>
                </Switch>
              </div>
            </Router>
          </Provider>
        )
      }
    }
    
    export default App
  `)

  await app.save()
}

export async function codegen (root: string, project: Project) {
  console.log('Removing CSS files...')
  await removeCss(root, project)

  console.log('Preparing store...')
  await prepareStore(root, project)

  console.log('Preparing Redux helpers...')
  await prepareReduxHelpers(root, project)

  console.log('Preparing styled components...')
  await prepareStyledComponents(root, project)

  console.log('Preparing components directory...')
  await prepareComponentsDir(root, project)

  console.log('Preparing home page...')
  await prepareHomePage(root, project)

  console.log('Setting up the app...')
  await setUpApp(root, project)

  console.log('Codegen done.')
}

export default async function boostrapApp (root: string, appName: string): Promise<Project> {
  console.log('Installing packages (may take a while)...')
  await runCommands(root, appName)
  console.log('Packages installed successfully.')
  const appRoot = path.join(root, appName)
  const project = new Project({
    tsConfigFilePath: path.join(appRoot, 'tsconfig.json'),
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
  })
  await codegen(appRoot, project)
  return project
}
