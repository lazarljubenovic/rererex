import Project from 'ts-simple-ast'
import path from 'path'
import * as casing from 'change-case'
import * as tags from 'common-tags'
import * as util from '../util'

export default async function (root: string, dirPath: string[], name: string, project: Project) {

  const pagesDirPath = util.paths.pages(root)
  const partialDir = util.mkdirp(project, pagesDirPath, dirPath.map(segment => casing.param(segment)))

  const fromFilePath = path.join(partialDir.getPath(), `${ casing.param(name) }.tsx`)
  const pathTo = util.paths.createPathTo(root, partialDir.getPath())

  const componentName = casing.pascal(name)

  const fileContent = tags.stripIndent`
    import React from 'react'
    import * as store from '${pathTo(util.paths.store)}'
    import { connect, MapStateToProps, MapDispatchToProps } from 'react-redux'
    
    // region Types
    
    export interface StateProps {
    }
    
    export interface DispatchProps {
    }
    
    export interface OwnProps {
    }
    
    export type Props = StateProps & DispatchProps & OwnProps
    
    // endregion Types
    
    const ${componentName}: React.SFC<Props> = props => {
      return (
        <div>
          <h3>Filters</h3>
        </div>
      )
    }
    
    // region Redux
    
    const mapStateToProps: MapStateToProps<StateProps, OwnProps, store.State> = (state, ownProps) => {
      return {}
    }
    
    const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = (dispatch, ownProps) => {
      return {}
    }
    
    export default connect(mapStateToProps, mapDispatchToProps)(${componentName})
    
    // endregion Redux
  `

  project.createSourceFile(fromFilePath, fileContent)

  await project.save()
  console.log(`Done!`)

}
