import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import App from './App'
import { createStore } from 'redux'
import reducers from './reducers'
import { Provider } from 'react-redux'

const store = createStore(
  reducers,
  (window as Window & typeof globalThis & { __REDUX_DEVTOOLS_EXTENSION__: Function }).__REDUX_DEVTOOLS_EXTENSION__?.()
)

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
