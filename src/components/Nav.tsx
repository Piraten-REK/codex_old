import NavItem from './NavItem'
import { ColumnsGap, People, Files, Archive } from 'react-bootstrap-icons'

const Nav = (): JSX.Element => {
  return (
    <aside id='app_nav' className='bg-primary'>
      <nav className='d-flex flex-column justify-content-start align.items-stretch h-100'>
        <h1 id='app_title'>Codex</h1>

        <ul className='flex-grow-1 m-0 p-0'>
          <NavItem path='/' name='Dashboard' Icon={ColumnsGap} exact />
          <NavItem path='/committees' name='Vorstände' Icon={People} />
          <NavItem path='/applications' name='Anträge' Icon={Files} />
          <NavItem path='https://archive.redmine.piraten-rek.de' name='Archiv' Icon={Archive} tooltip='Anträge vor dem 9. Kreisvorstand' />
        </ul>

        <footer>
          Login
        </footer>
      </nav>
    </aside>
  )
}

export default Nav
