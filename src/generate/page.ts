import Project from 'ts-simple-ast'
import path from 'path'
import * as casing from 'change-case'
import * as tags from 'common-tags'
import * as util from '../util'

export default async function (root: string, name: string, project: Project) {

  const pagesPath = util.paths.pages(root)
  const pagePath = path.join(pagesPath, casing.param(name))

  const pathTo = util.paths.createPathTo(root, pagePath)

  project.createDirectory(pagePath)
  project.createSourceFile(path.join(pagePath, 'index.ts'), tags.stripIndent`
    import component from './component'
    
    export {
      component,
    }
  `)
  project.createSourceFile(path.join(pagePath, 'component.tsx'), tags.stripIndent`
    import React from 'react'
    import * as store from '${pathTo(util.paths.store)}'
    import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
    import { Link } from 'react-router-dom'
    
    // region Types
    
    export interface StateProps {
    }
    
    export interface DispatchProps {
    }
    
    export interface OwnProps {
    }
    
    export type Props = StateProps & DispatchProps & OwnProps
    
    export interface State {
    }
    
    // endregion Types
    
    export class Component extends React.Component<Props, State> {

      public render () {
        return (
          <div className="${casing.pascal(name)}">
            <h1>${casing.title(name)}</h1>
          </div>
        )
      }

    }
    
    // region Redux
    
    const mapStateToProps: MapStateToProps<StateProps, OwnProps, store.State> = (state, ownProps) => {
      return {}
    }
    
    const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch, ownProps) => {
      return {}
    }
    
    export default connect(mapStateToProps, mapDispatchToProps)(Component)
    
    // endregion Redux
  `)

  const barrelFile = project.getSourceFileOrThrow(path.join(pagesPath, 'index.ts'))
  barrelFile.addImportDeclaration({
    moduleSpecifier: `./${casing.param(name)}`,
    namespaceImport: casing.camel(name),
  })
  barrelFile.getExportDeclarationOrThrow(() => true).addNamedExport(casing.camel(name))

  await project.save()
  console.log(`Done!`)

}
