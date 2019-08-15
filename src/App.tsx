import React, { useEffect, useState } from 'react'
import { withAuthenticator } from 'aws-amplify-react'
import Amplify, { Auth } from 'aws-amplify'
import { CognitoUser } from 'amazon-cognito-identity-js'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import { AboutPage } from './About/Page'
import { CatsPage } from './Cats/Page'
import { CatPage } from './Cat/Page'
import { Iot, IotData } from 'aws-sdk'
import { getPolicyNameFromArn } from './getPolicyNameFromArn'
import { NavbarBrandContextProvider } from './Navigation/NavbarBrand'
import { ToggleNavigation } from './Navigation/ToggleNavigation'

import './App.scss'

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

	return (
		<Router>
			<NavbarBrandContextProvider>
				<ToggleNavigation />
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
			</NavbarBrandContextProvider>
		</Router>
	)
}

export default withAuthenticator(App)
