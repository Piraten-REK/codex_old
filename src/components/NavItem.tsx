import { OverlayTrigger, Tooltip } from 'react-bootstrap'

import { NavLink as Link } from 'react-router-dom'
import { Icon } from 'react-bootstrap-icons'

const NavItem = ({ path, name, tooltip, Icon, exact }: { path: string, name: string, tooltip?: string, Icon: Icon, exact?: boolean }): JSX.Element => {
  if (tooltip == null) tooltip = name
  if (exact == null) exact = false

  if (/^(?:https?:)?\/\//.test(path)) {
    return (
      <li>
        <a href={path} target='_blank' rel='noreferrer' className='p-2 d-flex flex-column align-items-center'>
          <Icon />
          <OverlayTrigger
            placement='right'
            overlay={
              <Tooltip id={`tooltip-nav-${path.slice(1).replace(/\//g, '_')}`}>{tooltip}</Tooltip>
            }
          >
            <span className='pt-1'>{name}</span>
          </OverlayTrigger>
        </a>
      </li>
    )
  } else {
    return (
      <li>
        <Link to={path} className='p-2 d-flex flex-column align-items-center' exact={exact}>
          <Icon />
          <OverlayTrigger
            placement='right'
            overlay={
              <Tooltip id={`tooltip-nav-${path.slice(1).replace(/\//g, '_')}`}>{tooltip}</Tooltip>
            }
          >
            <span className='pt-1'>{name}</span>
          </OverlayTrigger>
        </Link>
      </li>
    )
  }
}

export default NavItem
