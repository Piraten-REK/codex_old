import { NullableReducer } from '.'

const sessionReducer: NullableReducer<string> = (state = sessionStorage.getItem('session'), action) => { // eslint-disable-line @typescript-eslint/default-param-last
  switch (action.type) {
    case 'SET':
      return action.payload as string|null
    case 'GET':
      return state
    case 'UNSET':
      return null
    default:
      return state
  }
}

export default sessionReducer
