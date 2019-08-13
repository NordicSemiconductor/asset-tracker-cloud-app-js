import React, { useEffect, useState } from 'react'
import { withAuthenticator } from 'aws-amplify-react'
import Amplify, { Auth } from 'aws-amplify'
import { CognitoUser } from 'amazon-cognito-identity-js'
import {
	Button,
	Collapse,
	Nav,
	Navbar,
	NavbarBrand,
	NavbarToggler,
	NavItem,
} from 'reactstrap'
import {
	BrowserRouter as Router,
	Link,
	Redirect,
	Route,
} from 'react-router-dom'
import { AboutPage } from './About/Page'
import { CatsPage } from './Cats/Page'
import { CatPage } from './Cat/Page'
import logo from './logo.svg'
import { Iot, IotData } from 'aws-sdk'
import { getPolicyNameFromArn } from './getPolicyNameFromArn'
import {
	List as ListIcon,
	Info as InfoIcon,
	PowerSettingsNew as LogoutIcon,
	HelpRounded as HelpIcon,
} from '@material-ui/icons'
import * as introJs from 'intro.js'

import './App.scss'
import '../node_modules/intro.js/introjs.css'

const intro = introJs()

Amplify.configure({
	Auth: {
		identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID,
		region: process.env.REACT_APP_REGION,
		userPoolId: process.env.REACT_APP_USER_POOL_ID,
		userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
		mandatorySignIn: true,
	},
})

const IdentityIdContext = React.createContext<string>('unauthorized')
export const IdentityIdConsumer = IdentityIdContext.Consumer
const CredentialsContext = React.createContext<{
	accessKeyId: string
	sessionToken: string
	secretAccessKey: string
}>({
	accessKeyId: '',
	sessionToken: '',
	secretAccessKey: '',
})
export const CredentialsConsumer = CredentialsContext.Consumer
const IotContext = React.createContext<{ iot: Iot; iotData: IotData }>({
	iot: new Iot(),
	iotData: new IotData({
		endpoint: process.env.REACT_APP_MQTT_ENDPOINT,
	}),
})
export const IotConsumer = IotContext.Consumer

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

const App = ({ authData }: { authData: CognitoUser }) => {
	const [credentials, setCredentials] = useState()
	const [iot, setIot] = useState()

	useEffect(() => {
		Auth.currentCredentials()
			.then(creds => {
				const c = Auth.essentialCredentials(creds)
				const iot = new Iot({
					credentials: creds,
					region: process.env.REACT_APP_REGION,
				})
				const iotData = new IotData({
					credentials: creds,
					endpoint: process.env.REACT_APP_MQTT_ENDPOINT,
					region: process.env.REACT_APP_REGION,
				})
				setCredentials(c)
				setIot({
					iot,
					iotData,
				})

				// Attach Iot Policy to user
				iot
					.listPrincipalPolicies({
						principal: c.identityId,
					})
					.promise()
					.then(async ({ policies }) => {
						if (policies && policies.length) {
							return
						}
						return iot
							.attachPrincipalPolicy({
								principal: `${c.identityId}`,
								policyName: getPolicyNameFromArn(
									`${process.env.REACT_APP_USER_IOT_POLICY_ARN}`,
								),
							})
							.promise()
							.then(() => undefined)
					})
					.catch(err => {
						console.error(err)
					})
			})
			.catch(error => {
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
					<NavbarToggler onClick={toggleNavigation} className="hideOnDesktop" />
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
			<Route exact path="/" render={() => <Redirect to="/cats" />} />
			{credentials && iot && (
				<CredentialsContext.Provider value={credentials}>
					<IdentityIdContext.Provider value={credentials.identityId}>
						<IotContext.Provider value={iot}>
							<Route exact path="/about" component={AboutPage} />
							<Route exact path="/cats" component={CatsPage} />
							<Route exact path="/cat/:catId" component={CatPage} />
						</IotContext.Provider>
					</IdentityIdContext.Provider>
				</CredentialsContext.Provider>
			)}
		</Router>
	)
}

export default withAuthenticator(App)
