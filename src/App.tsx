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
import { CatsPage } from './Cats/Page'
import { CatPage } from './Cat/Page'
import logo from './logo.svg'
import './App.scss'
import { Iot } from 'aws-sdk'

Amplify.configure({
	Auth: {
		identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
		region: process.env.REACT_APP_REGION,
		userPoolId: process.env.REACT_APP_USER_POOL_ID,
		userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
		mandatorySignIn: true,
	},
})

export const IdentityIdContext = React.createContext<string>('unauthorized')
export const CredentialsContext = React.createContext<{
	accessKeyId: string;
	sessionToken: string;
	secretAccessKey: string;
}>({
	accessKeyId: '',
	sessionToken: '',
	secretAccessKey: '',
})
export const IotContext = React.createContext<{ iot: Iot }>({
	iot: new Iot(),
})

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
				<Link className="nav-link" to="/cats" onClick={onClick}>
					Cats
				</Link>
			</NavItem>
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

const App = ({ authData }: { authData: CognitoUser }) => {
	const [credentials, setCredentials] = useState()
	const [iot, setIot] = useState()

	useEffect(() => {
		Auth.currentCredentials().then((creds) => {
			const c = Auth.essentialCredentials(creds)
			const iot = new Iot({
				credentials: creds,
				region: process.env.REACT_APP_REGION,
			})
			setCredentials(c)
			setIot({
				iot,
			})

			// Attach Iot Policy to user
			iot.listPrincipalPolicies({
				principal: c.identityId,
			})
				.promise()
				.then(({ policies }) => {
					if (policies && policies.length) {
						return
					}
					return iot.attachPrincipalPolicy({
						principal: `${c.identityId}`,
						policyName: `${process.env.REACT_APP_IOT_POLICY}`,
					}).promise()
						.then(() => undefined)
				})
				.catch(err => {
					console.error(err)
				})
		}).catch((error) => {
			//
		})
	}, [authData])

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
			<Route exact path="/" render={() => <Redirect to="/cats"/>}/>
			{credentials && iot && <CredentialsContext.Provider value={credentials}>
				<IdentityIdContext.Provider value={credentials.identityId}>
					<IotContext.Provider value={iot}>
						<Route exact path="/about" component={AboutPage}/>
						<Route exact path="/cats" component={CatsPage}/>
						<Route exact path="/cat/:catId" component={CatPage}/>
					</IotContext.Provider>
				</IdentityIdContext.Provider>
			</CredentialsContext.Provider>
			}
		</Router>
	)
}

export default withAuthenticator(App)
