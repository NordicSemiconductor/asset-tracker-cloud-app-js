import React, { useState } from 'react'
import { Collapse, Navbar, NavbarToggler } from 'reactstrap'
import styled from 'styled-components'
import { CloudFlavour, ReactAppConfigConsumer } from '..'
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

const AzureHeader = styled.header`
	background-color: #106ebe;
	button,
	a,
	a:visited,
	button.btn-link:hover,
	.navbar-brand {
		color: #fff !important;
	}
	button.btn-outline-danger {
		background-color: #00000020;
		border-color: #c30000;
		&:hover {
			background-color: #c30000;
		}
	}
`

const GCPHeader = styled(AzureHeader)`
	background-color: #1a73e8;
`

const AWSHeader = styled(AzureHeader)`
	background-color: #f90;
`

const flavouredHeaders = {
	[CloudFlavour.Azure]: AzureHeader,
	[CloudFlavour.GCP]: GCPHeader,
	[CloudFlavour.AWS]: AWSHeader,
}

const navbarClassname = {
	[CloudFlavour.Azure]: 'navbar-dark',
	[CloudFlavour.GCP]: 'navbar-dark',
	[CloudFlavour.AWS]: 'navbar-light',
}

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
		<ReactAppConfigConsumer>
			{({ cloudFlavour }) => {
				const FlavouredHeader = flavouredHeaders[cloudFlavour]
				return (
					<FlavouredHeader>
						<StyledNavbar className={navbarClassname[cloudFlavour]}>
							<MobileNavbar>
								<NavbarBrandConsumer>
									{({ navbar }) => navbar}
								</NavbarBrandConsumer>
								<NavbarToggler onClick={toggleNavigation} />
							</MobileNavbar>
							<DesktopOnly>
								<NavbarBrandConsumer>
									{({ navbar }) => navbar}
								</NavbarBrandConsumer>
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
										<Navigation
											onClick={toggleNavigation}
											onLogout={onLogout}
										/>
									</DesktopOnlyNavigation>
								</>
							)}
						</StyledNavbar>
					</FlavouredHeader>
				)
			}}
		</ReactAppConfigConsumer>
	)
}
