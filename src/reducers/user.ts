import { NullableReducer } from '.'
import { User } from '../API'

const userReducer: NullableReducer<User> = (state = 'user' in sessionStorage ? JSON.parse(sessionStorage.getItem('user') as string) as User : null, action) => { // eslint-disable-line @typescript-eslint/default-param-last
  switch (action.type) {
    case 'SET':
      return action.payload as User|null
    case 'GET':
      return state
    case 'UNSET':
      return null
    default:
      return state
  }
}

export default userReducer
