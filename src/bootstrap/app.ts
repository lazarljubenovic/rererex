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
  await exec(`yarn create react-app ${ cwd } --scripts-version=react-scripts-ts`)

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
  const cssFilePaths = ['App.css', 'index.css'].map(name => path.join(root, 'src', name))
  await Promise.all(cssFilePaths.map(path => util.promisify(fs.unlink)(path)))

  // Remove imports
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

  reducerFile.insertText(0, tag.stripIndent`
    import { combineReducers } from 'redux'
    import { reducer as form } from 'redux-form'
    
    export default combineReducers({
      form,
    })
  `)

  stateFile.insertText(0, tag.stripIndent`  
    export default interface State {
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

  await util.promisify(fs.rename)(path.join(root, 'images.d.ts'), path.join(root, 'additional.d.ts'))
  await util.promisify(fs.writeFile)(path.join(root, 'additional.d.ts'), tag.stripIndent`
    type GetActions<T extends Record<string, (...args: any[]) => any>> = ReturnType<T[keyof T]>
  `)
}

export async function makeLinterSane (root: string) {
  const filePath = path.join(root, 'tslint.json')
  const newText = tag.stripIndent`
    {
      "extends": [
        "tslint:recommended",
        "tslint-react",
        "tslint-config-prettier"
      ],
      "rules": {
        "no-empty-interface": false,
        "interface-name": false,
        "ordered-imports": false,
        "jsx-boolean-value": false,
        "object-literal-sort-keys": false,
        "triple-equals": false,
        "curly": [true, "ignore-same-line"],
        "no-console": false,
        "jsx-self-close": false
      },
      "linterOptions": {
        "exclude": [
          "config/**/*.js",
          "node_modules/**/*.ts",
          "coverage/lcov-report/*.js"
        ]
      }
    }
  `
  await util.promisify(fs.writeFile)(filePath, newText, 'utf8')
}

export async function prepareStyledComponents (root: string, project: Project) {
  const styledComponentsFile = project.createSourceFile(path.join(root, 'src', 'styled-components.ts'), tag.stripIndent`
    import * as styledComponents from 'styled-components'
    import ThemeInterface from './theme'
    
    const {
      default: styled,
      css,
      createGlobalStyle,
      keyframes,
      ThemeProvider,
    } = styledComponents as styledComponents.ThemedStyledComponentsModule<ThemeInterface>
    
    export {
      css,
      createGlobalStyle,
      keyframes,
      ThemeProvider,
    }
    
    export default styled
  `)
  const themeFile = project.createSourceFile(path.join(root, 'src', 'theme.ts'), tag.stripIndent`
    export default interface ThemeInterface {
      accentColor: string
      primaryColor: string
    }
  `)
  const files = [styledComponentsFile, themeFile]
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
    import * as home from './home'
    
    export {
      home,
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
    import React from 'react'
    import * as store from '../../store'
    import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
    import * as cmps from '../../components'
    
    // region Types
    
    export interface StateProps {
    }
    
    export interface DispatchProps {
    }
    
    export interface OwnProps {
    }
    
    export type Props = StateProps & DispatchProps & OwnProps
    
    // endregion Types
    
    export const component: React.SFC<Props> = props => (
      <div className="Home">
        <h1>Home</h1>
      </div>
    )
    
    // region Redux
    
    const mapStateToProps: MapStateToProps<StateProps, OwnProps, store.State> = (state, ownProps) => {
      return {}
    }
    
    const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch, ownProps) => {
      return {}
    }
    
    export default connect(mapStateToProps, mapDispatchToProps)(component)
    
    // endregion Redux
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
    import {createGlobalStyle} from './styled-components'
    
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
                  <Route path="/" exact component={ pages.home.component }/>
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

export async function makeTsConfigSane (root: string, project: Project) {
  await util.promisify(fs.writeFile)(path.join(root, 'tsconfig.json'), tag.stripIndent`
    {
      "compilerOptions": {
        "baseUrl": ".",
        "outDir": "build/dist",
        "module": "esnext",
        "target": "es5",
        "lib": [
          "es6",
          "dom"
        ],
        "sourceMap": true,
        "allowJs": true,
        "jsx": "react",
        "moduleResolution": "node",
        "rootDir": "src",
        "forceConsistentCasingInFileNames": true,
        "noImplicitReturns": true,
        "noImplicitThis": true,
        "noImplicitAny": true,
        "importHelpers": true,
        "strictNullChecks": true,
        "suppressImplicitAnyIndexErrors": true,
        "noUnusedLocals": false,
        "allowSyntheticDefaultImports": true
      },
      "exclude": [
        "node_modules",
        "build",
        "scripts",
        "acceptance-tests",
        "webpack",
        "jest",
        "src/setupTests.ts"
      ]
    }
  `)
}

export async function codegen (root: string, project: Project) {
  console.log('Removing CSS...')
  await removeCss(root, project)

  console.log('Preparing store...')
  await prepareStore(root, project)

  console.log('Preparing Redux helpers...')
  await prepareReduxHelpers(root, project)

  console.log('Making linter sane...')
  await makeLinterSane(root)

  console.log('Preparing styled components...')
  await prepareStyledComponents(root, project)

  console.log('Preparing components directory...')
  await prepareComponentsDir(root, project)

  console.log('Preparing home page...')
  await prepareHomePage(root, project)

  console.log('Setting up the app...')
  await setUpApp(root, project)

  console.log('Making tsconfig.json sane...')
  await makeTsConfigSane(root, project)

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
