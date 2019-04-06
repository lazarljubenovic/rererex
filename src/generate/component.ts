import Project from 'ts-simple-ast'
import path from 'path'
import * as casing from 'change-case'
import * as tags from 'common-tags'
import * as util from '../util'

export default async function (root: string, name: string, project: Project) {

  const componentsPath = util.paths.components(root)
  const componentName = casing.pascal(name)
  const componentFilename = componentName + '.tsx'

  const pathTo = util.paths.createPathTo(root, componentsPath)

  project.createSourceFile(path.join(componentsPath, componentFilename), tags.stripIndent`
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
    
    class ${componentName} extends React.Component<Props, State> {

      constructor (props: Props) {
        super(props)
      }

      public render () {
        return (
          <div className="${componentName}">
            <h2>${casing.title(name)} Component</h2>
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
    )(${componentName})
  `)

  const barrelFile = project.getSourceFileOrThrow(path.join(componentsPath, 'index.ts'))

  barrelFile.addImportDeclaration({
    moduleSpecifier: `./${componentName}`,
    namespaceImport: componentName,
  })
  barrelFile.getExportDeclarationOrThrow(() => true).addNamedExport(componentName)

  await project.save()
  console.log(`Done!`)

}
