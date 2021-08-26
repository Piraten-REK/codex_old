import { DefaultRootState, useSelector } from 'react-redux'

const Dashboard = (): JSX.Element => {
  const session = useSelector((state: DefaultRootState & { session: string|null }) => state.session)

  return (
    <div>
      <p>Dashboard</p>
      <pre>SESSION: {session}</pre>
    </div>
  )
}

export default Dashboard
