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
const ID_TOKEN = 'azure:idToken'

export const boot = ({
	clientId,
	redirectUri,
	authority,
}: {
	clientId: string
	redirectUri: string
	authority: string
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
