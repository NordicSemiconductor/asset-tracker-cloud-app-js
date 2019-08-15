import React, { useState } from 'react'
import { Auth } from 'aws-amplify'
import { Collapse, Navbar, NavbarToggler } from 'reactstrap'
import { NavbarBrandConsumer } from './NavbarBrand'
import { Navigation } from './Navigation'

import './ToggleNavigation.scss'

export const ToggleNavigation = () => {
	const [navigationVisible, setNavigationVisible] = useState(false)

	const toggleNavigation = () => setNavigationVisible(!navigationVisible)

	const logout = async () => {
		await Auth.signOut()
		window.location.reload()
	}

	return (
		<header className="bg-light">
			<Navbar color="light" light>
				<div className={'navbar-with-toggle hideOnDesktop'}>
					<NavbarBrandConsumer>{({ navbar }) => navbar}</NavbarBrandConsumer>
					<NavbarToggler onClick={toggleNavigation} />
				</div>
				<div className={'showOnDesktop'}>
					<NavbarBrandConsumer>{({ navbar }) => navbar}</NavbarBrandConsumer>
				</div>
				<Collapse isOpen={navigationVisible} navbar className="hideOnDesktop">
					<Navigation
						navbar={true}
						onClick={toggleNavigation}
						logout={logout}
					/>
				</Collapse>
				<Navigation
					className="showOnDesktop"
					onClick={toggleNavigation}
					logout={logout}
				/>
			</Navbar>
		</header>
	)
}
