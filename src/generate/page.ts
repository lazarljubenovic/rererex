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
    import * as React from 'react'
    import * as store from '${pathTo(util.paths.store)}'
    import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux'
    import { compose } from 'redux'
    import { Link } from 'react-router-dom'
    
    // region Types
    
    interface StateProps {
    }
    
    interface DispatchProps {
    }
    
    interface OwnProps {
    }
    
    type Props = StateProps & DispatchProps & OwnProps
    
    interface State {
    }
    
    // endregion Types
    
    class ${casing.pascal(name)} extends React.Component<Props, State> {

      constructor (props: Props) {
        super(props)
      }

      public render () {
        return (
          <div className="Page ${casing.pascal(name)}">
            <h1>${casing.title(name)} Page</h1>
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
    )(${casing.pascal(name)})
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
