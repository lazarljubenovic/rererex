import Project from 'ts-simple-ast'
import path from 'path'
import * as util from '../util'
import casing from 'change-case'
import * as tags from 'common-tags'

export default async function generateForm (root: string, dirPath: string[], name: string, project: Project) {

  const pagesDirPath = path.join(root, 'src', 'pages')
  const formDir = util.mkdirp(project, pagesDirPath, dirPath.map(segment => casing.param(segment)))

  const formFilePath = path.join(formDir.getPath(), `${ casing.param(name + '-form') }.tsx`)
  const pathTo = util.paths.createPathTo(root, formDir.getPath())

  const componentName = casing.pascal(name) + 'Form'

  const fileContent = tags.stripIndent`
    import React from 'react'
    import { Field, FormSubmitHandler, InjectedFormProps, reduxForm } from 'redux-form'
    import * as api from '${pathTo(util.paths.api)}'
    import * as cmps from '${pathTo(util.paths.components)}'
    import * as store from '${pathTo(util.paths.store)}'
    import { SubmissionError422 } from '${pathTo(util.paths.serverErrors)}'
    
    interface Props {
    }
    
    export interface FormValue {
      example: string
    }
    
    const formSubmitHandler: FormSubmitHandler<FormValue> = async (values, dispatch, props) => {
      // const response = await getDataFromServer(values)
      // if (response.status == 422) {
      //   throw new SubmissionError422(response.data)
      // }
    }
    
    const ${componentName}: React.SFC<Props & InjectedFormProps<FormValue & Props>> = props => (
      <div>
        <form onSubmit={ props.handleSubmit(formSubmitHandler) }>
          <cmps.layout.Vertical spacing={ 1 }>
            <Field
              label="Example"
              name="example"
              type="text"
              component={ cmps.ui.fields.input }
            />
            <cmps.ui.fields.loadableButton
              type="submit"
              isLoading={ props.submitting }
            >
              Submit
            </cmps.ui.fields.loadableButton>
          </cmps.layout.Vertical>
        </form>
      </div>
    )
    
    export default reduxForm<FormValue, Props>({ form: '${ casing.param(name) }' })(${componentName})
  `

  project.createSourceFile(formFilePath, fileContent)

  await project.save()
  console.log(`Done!`)

}
