import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Dashboard from './views/Dashboard'
import Nav from './components/Nav'

const App = (): JSX.Element => {
  return (
    <>
      <Router>
        <Nav />
        <Switch>
          <Route path='/' component={Dashboard} exact />
        </Switch>
      </Router>
    </>
  )
}

export default App
