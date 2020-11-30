import { ICredentials } from '@aws-amplify/core'
import { CognitoUser } from 'amazon-cognito-identity-js'
import Amplify, { Auth } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'
import { Iot, IotData } from 'aws-sdk'
import TimestreamQuery from 'aws-sdk/clients/timestreamquery'
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import { CatPage } from './Cat/Page'
import { CatsPage } from './Cats/Page'
import { CatsMapPage } from './CatsMap/Page'
import { NavbarBrandContextProvider } from '../Navigation/NavbarBrand'
import { ToggleNavigation } from '../Navigation/ToggleNavigation'
import { GlobalStyle } from '../Styles'
import { AboutPage } from './About/Page'
import { attachIotPolicyToIdentity } from './attachIotPolicyToIdentity'

import '@aws-amplify/ui/dist/style.css'

export type TimestreamQueryContextType = {
	timestreamQuery: TimestreamQuery
	db: string
	table: string
}

export type StackConfigContextType = {
	region: string
	avatarBucketName: string
	fotaBucketName: string
	geolocationApiEndpoint: string
	userPoolId: string
	userPoolClientId: string
	mqttEndpoint: string
	timestreamConfig: {
		db: string
		table: string
	}
}

export const boot = ({
	identityPoolId,
	userIotPolicyArn,
	region,
	userPoolId,
	userPoolClientId,
	timestreamConfig,
	mqttEndpoint,
	avatarBucketName,
	fotaBucketName,
	geolocationApiEndpoint,
}: {
	identityPoolId: string
	userIotPolicyArn: string
	region: string
	userPoolId: string
	userPoolClientId: string
	timestreamConfig: {
		db: string
		table: string
	}
	mqttEndpoint: string
	avatarBucketName: string
	fotaBucketName: string
	geolocationApiEndpoint: string
}) => {
	Amplify.configure({
		Auth: {
			identityPoolId,
			region,
			userPoolId,
			userPoolWebClientId: userPoolClientId,
			mandatorySignIn: true,
		},
	})

	const App = ({ authData }: { authData: CognitoUser }) => {
		const [credentials, setCredentials] = useState<ICredentials>()
		const [iot, setIot] = useState<{
			iot: Iot
			iotData: IotData
			mqttEndpoint: string
			region: string
		}>()
		const [
			timestreamQueryContext,
			setTimestreamQueryContext,
		] = useState<TimestreamQueryContextType>()
		useEffect(() => {
			Auth.currentCredentials()
				.then(async (creds) => {
					const c = Auth.essentialCredentials(creds)
					const iot = new Iot({
						credentials: creds,
						region,
					})
					const iotData = new IotData({
						credentials: creds,
						endpoint: mqttEndpoint,
						region,
					})
					setCredentials(c)
					setIot({
						iot,
						iotData,
						mqttEndpoint,
						region,
					})
					setTimestreamQueryContext({
						timestreamQuery: new TimestreamQuery({ region, credentials: c }),
						...timestreamConfig,
					})
					// Attach Iot Policy to user
					await attachIotPolicyToIdentity({
						iot,
						policyName: `${userIotPolicyArn}`.split('/')[1] ?? '',
					})(c.identityId)
				})
				.catch((error) => {
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
								.catch((error) => {
									// Woot?!
									console.error(error)
								})
						}}
					/>
					<Route exact path="/" render={() => <Redirect to="/cats" />} />
					{(credentials && iot && timestreamQueryContext && (
						<StackConfigContext.Provider
							value={{
								region,
								avatarBucketName,
								fotaBucketName,
								geolocationApiEndpoint,
								userPoolId,
								userPoolClientId,
								mqttEndpoint,
								timestreamConfig,
							}}
						>
							<CredentialsContext.Provider value={credentials}>
								<IotContext.Provider value={iot}>
									<TimestreamQueryContext.Provider
										value={timestreamQueryContext}
									>
										<Route exact path="/about" component={AboutPage} />
										<Route exact path="/cats" component={CatsPage} />
										<Route exact path="/cats-on-map" component={CatsMapPage} />
										<Route exact path="/cat/:catId" component={CatPage} />
									</TimestreamQueryContext.Provider>
								</IotContext.Provider>
							</CredentialsContext.Provider>
						</StackConfigContext.Provider>
					)) ||
						null}
				</NavbarBrandContextProvider>
			</Router>
		)
	}

	return withAuthenticator(App, {
		usernameAttributes: 'email',
		signUpConfig: {
			hiddenDefaults: ['phone_number'],
		},
	})
}

const CredentialsContext = React.createContext<ICredentials>({
	accessKeyId: '',
	sessionToken: '',
	secretAccessKey: '',
	identityId: '',
	authenticated: false,
})
export const CredentialsConsumer = CredentialsContext.Consumer

const IotContext = React.createContext<{
	iot: Iot
	iotData: IotData
	mqttEndpoint: string
	region: string
}>({
	iot: (undefined as unknown) as Iot,
	iotData: (undefined as unknown) as IotData,
	mqttEndpoint: '',
	region: '',
})
export const IotConsumer = IotContext.Consumer

const TimestreamQueryContext = React.createContext<TimestreamQueryContextType>({
	timestreamQuery: new TimestreamQuery({ region: 'us-east-1' }),
	db: '',
	table: '',
})
export const TimestreamQueryConsumer = TimestreamQueryContext.Consumer

const StackConfigContext = React.createContext<StackConfigContextType>({
	region: 'us-east-1',
	avatarBucketName: '',
	fotaBucketName: '',
	geolocationApiEndpoint: '',
	userPoolId: '',
	userPoolClientId: '',
	mqttEndpoint: '',
	timestreamConfig: {
		db: '',
		table: '',
	},
})
export const StackConfigConsumer = StackConfigContext.Consumer
