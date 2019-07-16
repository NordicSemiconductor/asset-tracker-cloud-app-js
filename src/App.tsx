import React, { useState, useEffect } from 'react'
import { withAuthenticator } from 'aws-amplify-react'
import Amplify, { Auth } from 'aws-amplify'
import { CognitoUser } from 'amazon-cognito-identity-js'
import {
	Navbar,
	NavbarBrand,
	Nav,
	NavItem,
	Button,
	NavbarToggler,
	Collapse,
} from 'reactstrap'
import {
	BrowserRouter as Router,
	Route,
	Link,
	Redirect,
} from 'react-router-dom'
import { AboutPage } from './About/Page'
import logo from './logo.svg'
import './App.scss'

Amplify.configure({
	Auth: {
		identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
		region: process.env.REACT_APP_AWS_REGION,
		userPoolId: process.env.REACT_APP_USER_POOL_ID,
		userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
		mandatorySignIn: true,
	},
})

export const AuthDataContext = React.createContext<{ identityId?: string }>({})

const Navigation = (props: {
	navbar?: boolean
	logout: () => void
	onClick?: () => void
	className?: string
}) => {
	const { navbar, logout, onClick } = props
	return (
		<Nav navbar={navbar} className={props.className}>
			<NavItem>
				<Link className="nav-link" to="/about" onClick={onClick}>
					About
				</Link>
			</NavItem>
			<NavItem>
				<Button onClick={logout} outline color="danger">
					Log out
				</Button>
			</NavItem>
		</Nav>
	)
}

const App = (_: { authData: CognitoUser }) => {
	const [identityId, setIdentityId] = useState()

	useEffect(() => {
		Auth.currentCredentials().then(({ identityId }) => {
			setIdentityId(identityId)
		}).catch((error) => {
			//
		})
	})

	const [navigationVisible, setNavigationVisible] = useState(false)

	const toggleNavigation = () => setNavigationVisible(!navigationVisible)

	const logout = async () => {
		await Auth.signOut()
		window.location.reload()
	}

	return (
		<Router>
			<header className="bg-light">
				<Navbar color="light" light>
					<NavbarBrand href="/">
						<img
							src={logo}
							width="30"
							height="30"
							className="d-inline-block align-top"
							alt="Cat Tracker"
						/>
						Cat Tracker
					</NavbarBrand>
					<NavbarToggler onClick={toggleNavigation} className="hideOnDesktop"/>
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
			<AuthDataContext.Provider value={{ identityId }}>
				<Route exact path="/" render={() => <Redirect to="/about"/>}/>
				<Route exact path="/about" component={AboutPage}/>
			</AuthDataContext.Provider>
		</Router>
	)
}

export default withAuthenticator(App)
