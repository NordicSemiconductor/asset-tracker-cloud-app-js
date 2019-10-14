import React, { useState } from 'react'
import { Collapse, Navbar, NavbarToggler } from 'reactstrap'
import styled from 'styled-components'

import {
	hideOnDesktop,
	mobileBreakpoint,
	showOnDesktop,
	wideBreakpoint,
} from '../Styles'
import { NavbarBrandConsumer } from './NavbarBrand'
import { Navigation } from './Navigation'

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

export const ToggleNavigation = ({
	loggedIn,
	onLogout,
}: {
	loggedIn: boolean
	onLogout: () => void
}) => {
	const [navigationVisible, setNavigationVisible] = useState(false)

	const toggleNavigation = () => setNavigationVisible(!navigationVisible)

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
				{loggedIn && (
					<>
						<MobileOnlyCollapse isOpen={navigationVisible} navbar>
							<Navigation
								navbar={true}
								onClick={toggleNavigation}
								onLogout={onLogout}
							/>
						</MobileOnlyCollapse>
						<DesktopOnlyNavigation>
							<Navigation onClick={toggleNavigation} onLogout={onLogout} />
						</DesktopOnlyNavigation>
					</>
				)}
			</StyledNavbar>
		</header>
	)
}
