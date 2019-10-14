import React, { useEffect, useState } from 'react'
import { withAuthenticator } from 'aws-amplify-react'
import Amplify, { Auth } from 'aws-amplify'
import { ICredentials } from '@aws-amplify/core'
import { CognitoUser } from 'amazon-cognito-identity-js'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import { AboutPage } from '../About/Page'
import { CatsPage } from '../Cats/Page'
import { CatPage } from '../Cat/Page'
import { CatsMapPage } from '../CatsMap/Page'
import { Iot, IotData } from 'aws-sdk'
import { NavbarBrandContextProvider } from '../Navigation/NavbarBrand'
import { ToggleNavigation } from '../Navigation/ToggleNavigation'
import { GlobalStyle } from '../Styles'
import { attachIotPolicyToIdentity } from './attachIotPolicyToIdentity'

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
const CredentialsContext = React.createContext<ICredentials>({
	accessKeyId: '',
	sessionToken: '',
	secretAccessKey: '',
	identityId: '',
	authenticated: false,
})
export const CredentialsConsumer = CredentialsContext.Consumer
const IotContext = React.createContext<{ iot: Iot; iotData: IotData }>({
	iot: new Iot(),
	iotData: new IotData({
		endpoint: process.env.REACT_APP_MQTT_ENDPOINT,
	}),
})
export const IotConsumer = IotContext.Consumer

const App = ({ authData }: { authData: CognitoUser }) => {
	const [credentials, setCredentials] = useState()
	const [iot, setIot] = useState()

	useEffect(() => {
		Auth.currentCredentials()
			.then(async creds => {
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
				await attachIotPolicyToIdentity({
					iot,
					policyName:
						`${process.env.REACT_APP_USER_IOT_POLICY_ARN}`.split('/')[1] || '',
				})(c.identityId)
			})
			.catch(error => {
				console.error(error)
			})
	}, [authData])

	return (
		<Router>
			<GlobalStyle />
			<NavbarBrandContextProvider>
				<ToggleNavigation
					loggedIn={true}
					onLogout={() => {
						Auth.signOut()
							.then(() => {
								window.location.reload()
							})
							.catch(error => {
								// Woot?!
								console.error(error)
							})
					}}
				/>
				<Route exact path="/" render={() => <Redirect to="/cats" />} />
				{credentials && iot && (
					<CredentialsContext.Provider value={credentials}>
						<IdentityIdContext.Provider value={credentials.identityId}>
							<IotContext.Provider value={iot}>
								<Route exact path="/about" component={AboutPage} />
								<Route exact path="/cats" component={CatsPage} />
								<Route exact path="/cats-on-map" component={CatsMapPage} />
								<Route exact path="/cat/:catId" component={CatPage} />
							</IotContext.Provider>
						</IdentityIdContext.Provider>
					</CredentialsContext.Provider>
				)}
			</NavbarBrandContextProvider>
		</Router>
	)
}

export default withAuthenticator(App)
