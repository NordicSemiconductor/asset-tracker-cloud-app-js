import { ICredentials } from '@aws-amplify/core'
import { CognitoUser } from 'amazon-cognito-identity-js'
import Amplify, { Auth } from 'aws-amplify'
import { withAuthenticator } from 'aws-amplify-react'
import { Iot, IotData } from 'aws-sdk'
import Athena from 'aws-sdk/clients/athena'
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import { CatPage } from '../Cat/Page'
import { CatsPage } from './Cats/Page'
import { CatsMapPage } from '../CatsMap/Page'
import { NavbarBrandContextProvider } from '../Navigation/NavbarBrand'
import { ToggleNavigation } from '../Navigation/ToggleNavigation'
import { GlobalStyle } from '../Styles'
import { AboutPage } from './About/Page'
import { attachIotPolicyToIdentity } from './attachIotPolicyToIdentity'

export type AthenaContext = {
	athena: Athena
	workGroup: string
	dataBase: string
	rawDataTable: string
}

export type StackConfigContext = {
	region: string
	avatarBucketName: string
	fotaBucketName: string
	cellGeoLocationCacheTable: string
}

export const boot = ({
	identityPoolId,
	userIotPolicyArn,
	region,
	userPoolId,
	userPoolWebClientId,
	athenaConfig,
	mqttEndpoint,
	avatarBucketName,
	fotaBucketName,
	cellGeoLocationCacheTable,
}: {
	identityPoolId: string
	userIotPolicyArn: string
	region: string
	userPoolId: string
	userPoolWebClientId: string
	athenaConfig: {
		workGroup: string
		dataBase: string
		rawDataTable: string
	}
	mqttEndpoint: string
	avatarBucketName: string
	fotaBucketName: string
	cellGeoLocationCacheTable: string
}) => {
	Amplify.configure({
		Auth: {
			identityPoolId,
			region,
			userPoolId,
			userPoolWebClientId,
			mandatorySignIn: true,
		},
	})

	const App = ({ authData }: { authData: CognitoUser }) => {
		const [credentials, setCredentials] = useState<ICredentials>()
		const [iot, setIot] = useState<{ iot: Iot; iotData: IotData }>()
		const [athenaContext, setAthenaContext] = useState<AthenaContext>()
		useEffect(() => {
			Auth.currentCredentials()
				.then(async creds => {
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
					})
					setAthenaContext({
						athena: new Athena({ region, credentials: c }),
						...athenaConfig,
					})
					// Attach Iot Policy to user
					await attachIotPolicyToIdentity({
						iot,
						policyName: `${userIotPolicyArn}`.split('/')[1] || '',
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
					{credentials && iot && athenaContext && (
						<StackConfigContext.Provider
							value={{
								region,
								avatarBucketName,
								fotaBucketName,
								cellGeoLocationCacheTable,
							}}
						>
							<CredentialsContext.Provider value={credentials}>
								<IdentityIdContext.Provider value={credentials.identityId}>
									<IotContext.Provider value={iot}>
										<AthenaContext.Provider value={athenaContext}>
											<Route exact path="/about" component={AboutPage} />
											<Route exact path="/cats" component={CatsPage} />
											<Route
												exact
												path="/cats-on-map"
												component={CatsMapPage}
											/>
											<Route exact path="/cat/:catId" component={CatPage} />
										</AthenaContext.Provider>
									</IotContext.Provider>
								</IdentityIdContext.Provider>
							</CredentialsContext.Provider>
						</StackConfigContext.Provider>
					)}
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
	iot: (undefined as unknown) as Iot,
	iotData: (undefined as unknown) as IotData,
})
export const IotConsumer = IotContext.Consumer

const AthenaContext = React.createContext<AthenaContext>({
	athena: new Athena({ region: 'us-east-1' }),
	workGroup: '',
	dataBase: '',
	rawDataTable: '',
})
export const AthenaConsumer = AthenaContext.Consumer

const StackConfigContext = React.createContext<StackConfigContext>({
	region: 'us-east-1',
	avatarBucketName: '',
	fotaBucketName: '',
	cellGeoLocationCacheTable: '',
})
export const StackConfigConsumer = StackConfigContext.Consumer
