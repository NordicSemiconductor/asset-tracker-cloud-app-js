import { Button, Nav, NavItem } from 'reactstrap'
import { Link } from 'react-router-dom'
import {
	HelpRounded as HelpIcon,
	Info as InfoIcon,
	List as ListIcon,
	PowerSettingsNew as LogoutIcon,
} from '@material-ui/icons'
import React from 'react'
import * as introJs from 'intro.js'
const intro = introJs()

export const Navigation = (props: {
	navbar?: boolean
	logout: () => void
	onClick?: () => void
	className?: string
}) => {
	const { navbar, logout, onClick } = props
	return (
		<Nav navbar={navbar} className={props.className}>
			<NavItem>
				<Link className="nav-link" to="/cats" onClick={onClick}>
					<ListIcon /> Cats
				</Link>
			</NavItem>
			<NavItem>
				<Link className="nav-link" to="/about" onClick={onClick}>
					<InfoIcon /> About
				</Link>
			</NavItem>
			<NavItem>
				<Button
					className="nav-link"
					color={'link'}
					onClick={() => {
						onClick && onClick()
						window.setTimeout(() => {
							window.requestAnimationFrame(() => {
								intro.start()
							})
						}, 1000)
					}}
				>
					<HelpIcon /> Help
				</Button>
			</NavItem>
			<NavItem>
				<Button onClick={logout} outline color="danger">
					<LogoutIcon /> Log out
				</Button>
			</NavItem>
		</Nav>
	)
}
