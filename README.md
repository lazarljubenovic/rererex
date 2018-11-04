# Rererex

> This project is **WIP**. Stay away or else!

Opinions which are included or will be included:

- `react` because duh
- `redux` because duh
- `react-redux` because of two duhs above
- `redux-form` because forms are extremly common and yet extremly complex to handle properly
- `react-router-dom` because real apps need deep links
- `connected-react-router` because the current page belongs to the store
- `redux-saga` because asynchronous stuff gets out of hand quickly
- `styled-components` because it's the least evil way to style
- `axios` because `fetch` is incomplete and `XMLHttpRequest` is an abomination

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
<summary><code>src/store/my-state/action-type.ts</code> has two dummy action types.</summary>

```
enum ActionType {
  action1 = 'test/action1',
  action2 = 'test/action2',
}

export default ActionType
```
</details>

<details>
<summary><code>src/store/my-state/actions.ts</code> has two dummy action creators.</summary>

```
import createAction from '../../create-action'
import ActionType from './action-type'

export const action1 = () => createAction(ActionType.action1)
export const action2 = () => createAction(ActionType.action2)
```
</details>

`src/store/my-state/interface.ts` is an empty file.

<details>
<summary><code>src/store/my-state/reducer.ts</code> has a reduced which handles the two dummy actions.</summary>

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
<summary><code>src/store/my-state/state.ts</code> is ready for type info on the state and the initial value.</summary>

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
<summary><code>src/store/my-state/index.ts</code> is a barrel which exposes relevant parts to public.</summary>

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
<summary><code>src/store/reducer.ts</code> is updated to include the newly created reducer for `my-state`.</summary>

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
<summary><code>src/store/state.ts</code> is updated in a similar fashion.</summary>

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
