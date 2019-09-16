import React, { useState } from 'react'
import { Auth } from 'aws-amplify'
import { Collapse, Navbar, NavbarToggler } from 'reactstrap'
import { NavbarBrandConsumer } from './NavbarBrand'
import { Navigation } from './Navigation'
import styled from 'styled-components'
import {
	hideOnDesktop,
	mobileBreakpoint,
	showOnDesktop,
	wideBreakpoint,
} from '../Styles'

const StyledNavbar = styled(Navbar)`
	z-index: 100;
	@media (min-width: ${wideBreakpoint}) {
		max-width: ${wideBreakpoint};
		margin: 0 auto;
	}
`

const MobileNavbar = hideOnDesktop(styled.div`
	width: 100%;
	display: flex;
	.navbar-brand {
		overflow: hidden;
		text-overflow: ellipsis;
		flex-grow: 1;
	}
`)

const MobileOnlyCollapse = hideOnDesktop(Collapse)

const DesktopOnly = showOnDesktop(styled.div``)
const DesktopOnlyNavigation = styled.div`
	.nav {
		display: none;
		@media (min-width: ${mobileBreakpoint}) {
			display: flex;
		}
	}
}
`

export const ToggleNavigation = () => {
	const [navigationVisible, setNavigationVisible] = useState(false)

	const toggleNavigation = () => setNavigationVisible(!navigationVisible)

	const logout = async () => {
		await Auth.signOut()
		window.location.reload()
	}

	return (
		<header className="bg-light">
			<StyledNavbar color="light" light>
				<MobileNavbar>
					<NavbarBrandConsumer>{({ navbar }) => navbar}</NavbarBrandConsumer>
					<NavbarToggler onClick={toggleNavigation} />
				</MobileNavbar>
				<DesktopOnly>
					<NavbarBrandConsumer>{({ navbar }) => navbar}</NavbarBrandConsumer>
				</DesktopOnly>
				<MobileOnlyCollapse isOpen={navigationVisible} navbar>
					<Navigation
						navbar={true}
						onClick={toggleNavigation}
						logout={logout}
					/>
				</MobileOnlyCollapse>
				<DesktopOnlyNavigation>
					<Navigation onClick={toggleNavigation} logout={logout} />
				</DesktopOnlyNavigation>
			</StyledNavbar>
		</header>
	)
}
