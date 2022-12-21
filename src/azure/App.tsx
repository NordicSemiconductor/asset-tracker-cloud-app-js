import { AuthResponse, UserAgentApplication } from 'msal'
import { randomUUID } from 'node:crypto'
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import { DisplayError as ErrorComponent } from '../Error/Error'
import { NavbarBrandContextProvider } from '../Navigation/NavbarBrand'
import { ToggleNavigation } from '../Navigation/ToggleNavigation'
import { GlobalStyle } from '../Styles'
import { AboutPage } from './About/Page'
import { ApiClient, fetchApiClient } from './api'
import { CatPage } from './Cat/Page'
import { CatsPage } from './Cats/Page'
import { CatsMapPage } from './CatsMap/Page'
import { Login } from './Login'

const ACCESS_TOKEN = 'azure:accessToken'

export type SolutionConfigContextType = {
	apiEndpoint: string
	clientId: string
}

const isExpiredToken = (token: AuthResponse) =>
	new Date(token.expiresOn).getTime() < Date.now()

const getTokenFromLocalStorage = (storename: string) => {
	const stored = window.localStorage.getItem(storename)
	if (stored === null) return
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
	apiEndpoint,
	adB2cTenant,
}: {
	clientId: string
	apiEndpoint: string
	adB2cTenant: string
}) => {
	const loc = new URL(document.location.href)
	const redirectUri = `${loc.protocol}//${loc.host}`
	console.log('Client ID', clientId)
	console.log('Redirect URI', redirectUri)
	console.log('AD B2C Tenant', adB2cTenant)
	const authority = `https://${adB2cTenant}.b2clogin.com/${adB2cTenant}.onmicrosoft.com/B2C_1_signup_signin`
	console.log('AD B2C Authority', authority)
	console.log('API Endpoint', apiEndpoint)
	const apiScope = `https://${adB2cTenant}.onmicrosoft.com/api`
	const scopes = [
		`${apiScope}/user_impersonation`,
		`${apiScope}/nrfassettracker.admin`,
	]
	console.log('Token Scopes', scopes)

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
		scopes,
		sid: randomUUID(),
	}

	const acquireAccessToken = async () =>
		new Promise<AuthResponse>((resolve, reject) => {
			userAgentApplication
				.acquireTokenSilent(tokenRequest)
				.then(resolve)
				.catch((error: Record<string, string>) => {
					//Acquire token silent failure, and send an interactive request
					if (
						(error.errorMessage?.includes('interaction_required') ?? false) ||
						(error.message?.includes('User login is required') ?? false) ||
						(error.message?.includes('AADB2C90077') ?? false)
					) {
						return userAgentApplication
							.acquireTokenPopup(tokenRequest)
							.then(resolve)
							.catch(reject)
					}
					reject(error)
				})
		})

	return () => {
		const [accessToken, setAccessToken] = useState<AuthResponse | undefined>(
			getTokenFromLocalStorage(ACCESS_TOKEN),
		)
		const [error, setError] = useState<Error>()

		useEffect(() => {
			let isCancelled = false
			if (accessToken === undefined) {
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
			<Router>
				<GlobalStyle />
				<NavbarBrandContextProvider>
					<ToggleNavigation
						loggedIn={accessToken !== undefined}
						onLogout={() => {
							window.localStorage.clear()
							setAccessToken(undefined)
							setError(undefined)
							userAgentApplication.logout()
						}}
					/>
					{accessToken === undefined && (
						<Login
							onLogin={() => {
								acquireAccessToken()
									.then((token) => {
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
					{error !== undefined && <ErrorComponent error={error} />}
					{accessToken && (
						<AccessTokenContext.Provider value={accessToken}>
							<ApiClientContext.Provider
								value={fetchApiClient({
									endpoint: apiEndpoint,
									token: accessToken.accessToken,
								})}
							>
								<SolutionConfigContext.Provider
									value={{
										apiEndpoint,
										clientId,
									}}
								>
									<Route
										exact
										path="/"
										render={() => <Redirect to="/cats" />}
									/>
									<Route exact path="/about" component={AboutPage} />
									<Route exact path="/cats" component={CatsPage} />
									<Route exact path="/cat/:catId" component={CatPage} />
									<Route exact path="/cats-on-map" component={CatsMapPage} />
								</SolutionConfigContext.Provider>
							</ApiClientContext.Provider>
						</AccessTokenContext.Provider>
					)}
				</NavbarBrandContextProvider>
			</Router>
		)
	}
}

const AccessTokenContext = React.createContext<AuthResponse>(
	undefined as unknown as AuthResponse,
)
export const AccessTokenConsumer = AccessTokenContext.Consumer

const ApiClientContext = React.createContext<ApiClient>(
	undefined as unknown as ApiClient,
)
export const ApiClientConsumer = ApiClientContext.Consumer

const SolutionConfigContext = React.createContext<SolutionConfigContextType>({
	apiEndpoint: '',
	clientId: '',
})
export const SolutionConfigConsumer = SolutionConfigContext.Consumer
