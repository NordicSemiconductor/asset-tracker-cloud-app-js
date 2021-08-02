import React from 'react'
import { Collapse, Navbar, NavbarToggler } from 'reactstrap'
import styled from 'styled-components'
import { CloudFlavour } from '../../../flavour'
import {
	hideOnDesktop,
	mobileBreakpoint,
	showOnDesktop,
	wideBreakpoint,
} from '../../../Styles'
import { FlavouredNavbarBrand } from './NavbarBrand'
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

const AWSHeader = styled(AzureHeader)`
	background-color: #f90;
`

const flavouredHeaders = {
	[CloudFlavour.Azure]: AzureHeader,
	[CloudFlavour.AWS]: AWSHeader,
}

const navbarClassname = {
	[CloudFlavour.Azure]: 'navbar-dark',
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

export class ToggleNavigation<
	P extends {
		loggedIn: boolean
		onLogout: () => void
		cloudFlavour: CloudFlavour
	},
> extends React.Component<P, { navigationVisible: boolean }> {
	constructor(props: P) {
		super(props)
		this.state = { navigationVisible: false }
	}

	render() {
		const { navigationVisible } = this.state
		const toggleNavigation = () =>
			this.setState({ navigationVisible: !this.state.navigationVisible })

		const { cloudFlavour, loggedIn, onLogout } = this.props
		const FlavouredHeader = flavouredHeaders[
			cloudFlavour
		] as React.ComponentType

		return (
			<FlavouredHeader>
				<StyledNavbar className={navbarClassname[cloudFlavour]}>
					<MobileNavbar>
						<FlavouredNavbarBrand cloudFlavour={cloudFlavour} />
						<NavbarToggler onClick={toggleNavigation} />
					</MobileNavbar>
					<DesktopOnly>
						<FlavouredNavbarBrand cloudFlavour={cloudFlavour} />
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
			</FlavouredHeader>
		)
	}
}
