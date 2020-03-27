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
import { v4 } from 'uuid'

const ACCESS_TOKEN = 'azure:accessToken'

export type SolutionConfigContext = {
	apiEndpoint: string
	clientId: string
}

const isExpiredToken = (token: AuthResponse) =>
	new Date(token.expiresOn).getTime() < Date.now()

const getTokenFromLocalStorage = (storename: string) => {
	const stored = window.localStorage.getItem(storename)
	if (!stored) return
	const t = JSON.parse(stored)
	if (isExpiredToken(t)) {
		console.debug(`${storename} token expired`)
		window.localStorage.removeItem(storename)
		return
	}
	return t
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
			storeAuthStateInCookie: true, // See https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/435
		},
	})

	const tokenRequest = {
		scopes: ['https://bifravstonazure.onmicrosoft.com/api/user_impersonation'],
		sid: v4(),
	}

	const acquireAccessToken = async () =>
		new Promise<AuthResponse>((resolve, reject) => {
			userAgentApplication
				.acquireTokenSilent(tokenRequest)
				.then(resolve)
				.catch(error => {
					//Acquire token silent failure, and send an interactive request
					if (
						error?.errorMessage?.includes('interaction_required') ||
						error?.message?.includes('User login is required') ||
						error?.message?.includes('AADB2C90077')
					) {
						return userAgentApplication
							.acquireTokenPopup(tokenRequest)
							.then(resolve)
							.catch(reject)
					}
					reject(error)
				})
		})

	const history = createBrowserHistory()

	return () => {
		const [accessToken, setAccessToken] = useState<AuthResponse>(
			getTokenFromLocalStorage(ACCESS_TOKEN),
		)
		const [error, setError] = useState<Error>()

		useEffect(() => {
			let isCancelled = false
			if (!accessToken) {
				return
			}
			const i = setTimeout(async () => {
				console.log('Token timeout')
				window.localStorage.removeItem(ACCESS_TOKEN)
				const token = await acquireAccessToken()
				window.localStorage.setItem(ACCESS_TOKEN, JSON.stringify(token))
				if (!isCancelled) setAccessToken(token)
			}, new Date(accessToken.expiresOn).getTime() - Date.now())

			return () => {
				isCancelled = true
				clearInterval(i)
			}
		}, [accessToken])

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
							setAccessToken(undefined as any)
							setError(undefined)
							userAgentApplication.logout()
						}}
					/>
					{!accessToken && (
						<Login
							onLogin={() => {
								acquireAccessToken()
									.then(token => {
										setAccessToken(token)
										window.localStorage.setItem(
											ACCESS_TOKEN,
											JSON.stringify(token),
										)
									})
									.catch(setError)
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
