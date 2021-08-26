import { useSelector } from 'react-redux'
import { state } from '../reducers'
import { Button } from 'react-bootstrap'

const Login = (): JSX.Element => {
  const session = useSelector((state: state) => state.session)
  const user = useSelector((state: state) => state.user)

  if (session === null || user === null) {
    return <Button>Login</Button>
  } else {
    return (
      <>
        <div className='login-wrapper'>
          <img src={user.avatar ?? '/defaultAvatar.svg'} alt={user.displayName} />
          <span>{user.displayName}</span>
          <span>{user.username}</span>
        </div>
      </>
    )
  }
}

export default Login
