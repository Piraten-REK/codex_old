import { User } from '../API'

export const setSession = (data: string): ReduxAction => {
  return {
    type: 'SET',
    payload: data
  }
}

export const getSession = (): ReduxAction => {
  return {
    type: 'GET'
  }
}

export const unsetSession = (): ReduxAction => {
  return {
    type: 'UNSET'
  }
}

export const setUser = (data: User): ReduxAction => {
  return {
    type: 'SET',
    payload: data
  }
}

export const getUser = (): ReduxAction => {
  return {
    type: 'GET'
  }
}

export const unsetUser = (): ReduxAction => {
  return {
    type: 'UNSET'
  }
}

interface ReduxAction { type: string, payload?: any }
