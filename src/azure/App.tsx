import { createBrowserHistory } from 'history'
import React, { useState } from 'react'
import { Redirect, Route, Router } from 'react-router-dom'
import { NavbarBrandContextProvider } from '../Navigation/NavbarBrand'
import { ToggleNavigation } from '../Navigation/ToggleNavigation'
import { GlobalStyle } from '../Styles'
import { UserAgentApplication, AuthResponse } from 'msal'
import { AboutPage } from './About/Page'
import { Error as ErrorComponent } from '../Error/Error'
import { Login } from './Login'

const USER_STORE = 'azure:user'

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

	const history = createBrowserHistory()

	return () => {
		const storedUser = window.localStorage.getItem(USER_STORE)
		const [user, setUser] = useState<AuthResponse>(
			(storedUser && JSON.parse(storedUser)) || undefined,
		)
		const [error, setError] = useState<Error>()

		userAgentApplication.handleRedirectCallback((err, response) => {
			if (err) {
				console.error(`Login failed: ${err.message}`)
				setError(err)
				return
			}
			if (!response) {
				console.error(`No user contained in callback!`)
				setError(new Error('No user contained in callback!'))
				return
			}
			setUser(response)
			window.localStorage.setItem(USER_STORE, JSON.stringify(response))
		})

		return (
			<Router history={history}>
				<GlobalStyle />
				<ToggleNavigation
					loggedIn={user !== undefined}
					onLogout={() => {
						window.localStorage.clear()
						userAgentApplication.logout()
					}}
				/>
				{!user && (
					<Login
						onLogin={() => {
							const loginRequest = {
								scopes: ['https://graph.microsoft.com/User.ReadWrite'],
							}
							userAgentApplication.loginRedirect(loginRequest)
						}}
					/>
				)}
				{error && <ErrorComponent error={error} />}
				{user && (
					<NavbarBrandContextProvider>
						<IdentityIdContext.Provider value={user.uniqueId}>
							<Route exact path="/" render={() => <Redirect to="/cats" />} />
							<Route exact path="/about" component={AboutPage} />
						</IdentityIdContext.Provider>
					</NavbarBrandContextProvider>
				)}
			</Router>
		)
	}
}

const IdentityIdContext = React.createContext<string>('unauthorized')
export const IdentityIdConsumer = IdentityIdContext.Consumer
