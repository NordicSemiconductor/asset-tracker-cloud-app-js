import { Button, Nav, NavItem } from 'reactstrap'
import { Link } from 'react-router-dom'
import React from 'react'
import * as introJs from 'intro.js'
import { emojify } from '../Emojify/Emojify'
const intro = introJs()

export const Navigation = (props: {
	navbar?: boolean
	logout: () => void
	onClick?: () => void
}) => {
	const { navbar, logout, onClick } = props
	return (
		<Nav navbar={navbar}>
			<NavItem>
				<Link className="nav-link" to="/cats" onClick={onClick}>
					{emojify('🐱')} Cats
				</Link>
			</NavItem>
			<NavItem>
				<Link className="nav-link" to="/cats-on-map" onClick={onClick}>
					{emojify('🗺️')} Map
				</Link>
			</NavItem>
			<NavItem>
				<Link className="nav-link" to="/about" onClick={onClick}>
					{emojify('ℹ️')} About
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
					{emojify('💁')} Help
				</Button>
			</NavItem>
			<NavItem>
				<Button onClick={logout} outline color="danger">
					{emojify('🚪')} Log out
				</Button>
			</NavItem>
		</Nav>
	)
}
