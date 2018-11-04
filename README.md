# Rererex

> This project is **WIP**. Stay away or else!

## Commands

- `g`, `generate`
  - `s`, `store`
  - `a`, `action`
- `rm`, `remove`
  - `a`, `action`

### Generate store

Generates an additional chunk of the store with two dummy actions and handles some relevant boilerplate.

```
$ rrr generate store my-state
$ rrr g s my-state
```

<details>
<summary>Generated files</summary>

<details>
<summary>`src/store/my-state/action-type.ts` has two dummy action types.</summary>

```
enum ActionType {
  action1 = 'test/action1',
  action2 = 'test/action2',
}

export default ActionType
```
</details>

<details>
<summary>`src/store/my-state/actions.ts` has two dummy action creators.</summary>

```
import createAction from '../../create-action'
import ActionType from './action-type'

export const action1 = () => createAction(ActionType.action1)
export const action2 = () => createAction(ActionType.action2)
```
</details>

`src/store/my-state/interface.ts` is an empty file.

<details>
<summary>`src/store/my-state/reducer.ts` has a reduced which handles the two dummy actions.</summary>

```
import { Reducer } from 'redux'
import State, { initialState } from './state'
import ActionType from './action-type'
import * as utils from '../../utils'

type Action = GetActions<typeof import('./actions')>

const reducer: Reducer<State, Action> = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.action1:
      return {
        ...state,
      }
    case ActionType.action2:
      return {
        ...state,
      }
    default:
      utils.assertNever(action)
      return state
  }
}

export default reducer
```
</details>

<details>
<summary>`src/store/my-state/state.ts` is ready for type info on the state and the initial value.</summary>

```
interface Interface {
}

type State = Interface | null

const initialState: State = null

export default State
export { initialState }
```
</details>

<details>
<summary>`src/store/my-state/index.ts` is a barrel which exposes relevant parts to public.</summary>

```
import * as actionTypes from './action-type'
import * as actions from './actions'
import * as reducer from './reducer'
import * as state from './state'

export {
  actionTypes,
  actions,
  reducer,
  state,
}
```
</details>

<details>
<summary>`src/store/reducer.ts` is updated to include the newly created reducer for `my-state`.</summary>

```
import { combineReducers } from 'redux'

import { reducer as form } from 'redux-form'

import me from './me/reducer'
import myState from './test/my-state';

export default combineReducers({
  form,
  me,
  myState,
})
```
</details>

<details>
<summary>`src/store/state.ts` is updated in a similar fashion.</summary>

```
import Me from './me/state'
import MyState from './my-state/state';

export default interface State {
  me: Me,
  myState: MyState;
}
```
</details>

</details>

### Generate action

Generates an additional action to an existing store chunk.

```
$ rrr generate action my-state/my-action
$ rrr g a my-state/my-action
```

### Remove action

Removes an existing action.

```
$ rrr remove action my-state/my-action
$ rrr rm a my-state/my-action
```
