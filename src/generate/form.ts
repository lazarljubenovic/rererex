import Project from 'ts-simple-ast'
import path from 'path'
import * as util from '../util'
import casing from 'change-case'
import * as tags from 'common-tags'

export default async function generateForm (root: string, dirPath: string[], name: string, project: Project) {

  const pagesDirPath = path.join(root, 'src', 'pages')
  const formDirPath = util.mkdirp(project, pagesDirPath, dirPath.map(segment => casing.param(segment)))

  const fileContent = tags.stripIndent`
    import React from 'react'
    import * as api from '../../api'
    import * as cmps from '../../components'
    import * as store from '../../store'
    import { Field, FormSubmitHandler, InjectedFormProps, reduxForm } from 'redux-form'
    import { SubmissionError422 } from '../../server-errors'
    
    interface FormValue {
      example: string
    }
    
    const formSubmitHandler: FormSubmitHandler<FormValue> = async (values, dispatch, props) => {
      // const response = await api.entity.endpoint(values)
      // if (response.status == 422) {
      //   throw new SubmissionError422(response.data)
      // }
      // const user = await api.me.single()
      // dispatch(store.scope.actions.logIn(user))
    }
    
    const LoginFormCmp: React.SFC<InjectedFormProps> = props => (
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
    
    export default reduxForm({ form: '${ casing.param(name) }' })(LoginFormCmp)
  `

  const formFilePath = path.join(formDirPath.getPath(), `${ casing.param(name + '-form') }.tsx`)
  const formFile = project.createSourceFile(formFilePath, fileContent)

  await project.save()
  console.log(`Done!`)

}
