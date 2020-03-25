import { createBrowserHistory } from 'history'
import React, { useState, useEffect } from 'react'
import { Redirect, Route, Router } from 'react-router-dom'
import { NavbarBrandContextProvider } from '../Navigation/NavbarBrand'
import { ToggleNavigation } from '../Navigation/ToggleNavigation'
import { GlobalStyle } from '../Styles'
import { AboutPage } from './About/Page'
import { Error as ErrorComponent } from '../Error/Error'
import { Login } from './Login'
import { CatsPage } from './Cats/Page'
import { UserAgentApplication, AuthResponse } from 'msal'
import { Twin } from 'azure-iothub'

const ACCESS_TOKEN = 'azure:accessToken'
const ID_TOKEN = 'azure:idToken'

export type SolutionConfigContext = {
	apiEndpoint: string
	clientId: string
}

export const boot = ({
	clientId,
	redirectUri,
	authority,
	apiEndpoint,
}: {
	clientId: string
	redirectUri: string
	authority: string
	apiEndpoint: string
}) => {
	const userAgentApplication = new UserAgentApplication({
		auth: {
			clientId,
			redirectUri,
			authority,
			validateAuthority: false,
		},
		cache: {
			cacheLocation: 'localStorage',
			storeAuthStateInCookie: true,
		},
	})

	const tokenRequest = {
		scopes: ['https://bifravstonazure.onmicrosoft.com/api/user_impersonation'],
	}

	const history = createBrowserHistory()

	return () => {
		const storedAccessToken = window.localStorage.getItem(ACCESS_TOKEN)
		const [accessToken, setAccessToken] = useState<AuthResponse>(
			(storedAccessToken && JSON.parse(storedAccessToken)) || undefined,
		)
		const storedUser = window.localStorage.getItem(ID_TOKEN)
		const [idToken, setIdToken] = useState<AuthResponse>(
			(storedUser && JSON.parse(storedUser)) || undefined,
		)
		const [error, setError] = useState<Error>()

		userAgentApplication.handleRedirectCallback((error, response) => {
			if (error) {
				setError(error)
				if (error.message.includes('AADB2C90118')) {
					// FIXME: Implement lost password flow
					console.log('Go to this link, to change your password')
					console.log(
						`https://bifravstonazure.b2clogin.com/bifravstonazure.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_pw_reset&client_id=${clientId}&nonce=defaultNonce&redirect_uri=https%3A%2F%2Fbifravstwebsite.azurewebsites.net%2F.auth%2Flogin%2Faad%2Fcallback&scope=openid&response_type=id_token&prompt=login`,
					)
				}
			} else if (response) {
				const { tokenType } = response
				switch (tokenType) {
					case 'id_token':
						setIdToken(response)
						window.localStorage.setItem(ID_TOKEN, JSON.stringify(response))
						break
					case 'access_token':
						setAccessToken(response)
						window.localStorage.setItem(ACCESS_TOKEN, JSON.stringify(response))
						break
				}
			}
		})

		useEffect(() => {
			if (!idToken) {
				return
			}
			if (
				accessToken &&
				new Date(accessToken.expiresOn).getTime() > Date.now()
			) {
				return
			}
			console.log({
				idToken,
				accessToken,
			})
			userAgentApplication.acquireTokenRedirect(tokenRequest)
		}, [idToken, accessToken])

		return (
			<SolutionConfigContext.Provider
				value={{
					apiEndpoint,
					clientId,
				}}
			>
				<Router history={history}>
					<GlobalStyle />
					<ToggleNavigation
						loggedIn={accessToken !== undefined}
						onLogout={() => {
							window.localStorage.clear()
							setIdToken(undefined as any)
							setAccessToken(undefined as any)
							setError(undefined)
							userAgentApplication.logout()
						}}
					/>
					{!accessToken && (
						<Login
							onLogin={() => {
								userAgentApplication.loginRedirect(tokenRequest)
							}}
						/>
					)}
					{error && <ErrorComponent error={error} />}
					{accessToken && (
						<NavbarBrandContextProvider>
							<AccessTokenContext.Provider value={accessToken}>
								<ApiClientContext.Provider
									value={fetchApiClient({
										endpoint: apiEndpoint,
										token: accessToken.accessToken,
									})}
								>
									<Route
										exact
										path="/"
										render={() => <Redirect to="/cats" />}
									/>
									<Route exact path="/about" component={AboutPage} />
									<Route exact path="/cats" component={CatsPage} />
								</ApiClientContext.Provider>
							</AccessTokenContext.Provider>
						</NavbarBrandContextProvider>
					)}
				</Router>
			</SolutionConfigContext.Provider>
		)
	}
}

const AccessTokenContext = React.createContext<AuthResponse>(
	(undefined as unknown) as AuthResponse,
)
export const AccessTokenConsumer = AccessTokenContext.Consumer

const ApiClientContext = React.createContext<ApiClient>(
	(undefined as unknown) as ApiClient,
)
export const ApiClientConsumer = ApiClientContext.Consumer

export type ApiClient = {
	listDevices: () => Promise<Twin[]>
}

const fetchApiClient = ({
	endpoint,
	token,
}: {
	endpoint: string
	token: string
}): ApiClient => {
	const iotHubRequestHeaders = new Headers()
	iotHubRequestHeaders.append('Authorization', 'Bearer ' + token)
	iotHubRequestHeaders.append('Content-Type', 'application/json')
	const get = <A extends object>(resource: string) => async (): Promise<A> => {
		const res = await fetch(`${endpoint}/api/${resource}`, {
			method: 'GET',
			headers: iotHubRequestHeaders,
		})
		return res.json()
	}

	return {
		listDevices: get<Twin[]>('listdevices'),
	}
}

const SolutionConfigContext = React.createContext<SolutionConfigContext>({
	apiEndpoint: '',
	clientId: '',
})
export const SolutionConfigConsumer = SolutionConfigContext.Consumer
