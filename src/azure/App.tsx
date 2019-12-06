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

const ACCESS_TOKEN = 'azure:accessToken'
const USER = 'azure:user'

export const boot = ({
	clientId,
	redirectUri,
}: {
	clientId: string
	redirectUri: string
}) => {
	const userAgentApplication = new UserAgentApplication({
		auth: {
			clientId,
			redirectUri,
		},
	})

	const scopes = {
		scopes: ['user.read'],
	}

	const history = createBrowserHistory()

	return () => {
		const storedAccessToken = window.localStorage.getItem(ACCESS_TOKEN)
		const [accessToken, setAccessToken] = useState<AuthResponse>(
			(storedAccessToken && JSON.parse(storedAccessToken)) || undefined,
		)
		const storedUser = window.localStorage.getItem(USER)
		const [user, setUser] = useState<AuthResponse>(
			(storedUser && JSON.parse(storedUser)) || undefined,
		)
		const [error, setError] = useState<Error>()

		userAgentApplication.handleRedirectCallback((error, response) => {
			if (error) {
				setError(error)
			} else if (response) {
				console.log('user', response)
				setUser(response)
				window.localStorage.setItem(USER, JSON.stringify(response))
			}
		})

		useEffect(() => {
			if (!user) {
				return
			}
			if (new Date(accessToken.expiresOn).getTime() > Date.now()) {
				return
			}
			// FIXME: Refresh token regularly?
			userAgentApplication
				.acquireTokenSilent(scopes)
				.then(accessTokenResponse => {
					console.log('accessToken', accessTokenResponse)
					// Acquire token silent success
					// Call API with token
					setAccessToken(accessTokenResponse)
					window.localStorage.setItem(
						ACCESS_TOKEN,
						JSON.stringify(accessTokenResponse),
					)
				})
				.catch(error => {
					//Acquire token silent failure, and send an interactive request
					setError(error)
					if (error.errorMessage.indexOf('interaction_required') !== -1) {
						userAgentApplication.acquireTokenRedirect(scopes)
					}
				})
		}, [user, accessToken])

		return (
			<Router history={history}>
				<GlobalStyle />
				<ToggleNavigation
					loggedIn={accessToken !== undefined}
					onLogout={() => {
						window.localStorage.clear()
						setUser(undefined as any)
						setAccessToken(undefined as any)
						// userAgentApplication.logout()
					}}
				/>
				{!accessToken && (
					<Login
						onLogin={() => {
							userAgentApplication.loginRedirect(scopes)
						}}
					/>
				)}
				{error && <ErrorComponent error={error} />}
				{accessToken && (
					<NavbarBrandContextProvider>
						<AccessTokenContext.Provider value={accessToken}>
							<Route exact path="/" render={() => <Redirect to="/cats" />} />
							<Route exact path="/about" component={AboutPage} />
							<Route exact path="/cats" component={CatsPage} />
						</AccessTokenContext.Provider>
					</NavbarBrandContextProvider>
				)}
			</Router>
		)
	}
}

const AccessTokenContext = React.createContext<AuthResponse>(
	(undefined as unknown) as AuthResponse,
)
export const AccessTokenConsumer = AccessTokenContext.Consumer
