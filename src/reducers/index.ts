import { DefaultRootState } from 'react-redux'
import { combineReducers } from 'redux'
import session from './session'
import user from './user'
import { User } from '../API'

const reducers = combineReducers({
  session,
  user
})

export default reducers

export type Reducer<T> = (state: T, action: { type: string, payload?: T }) => T
export type NullableReducer<T> = Reducer<T|null>

export type state = DefaultRootState & {
  session: string|null
  user: User|null
}
