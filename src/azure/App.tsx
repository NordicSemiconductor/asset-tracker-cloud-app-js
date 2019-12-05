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
import { AuthManager, LoggedIn } from '@azure/ms-rest-browserauth'
import { ServiceClientCredentials } from '@azure/ms-rest-js'

const USER_STORE = 'azure:user'

export const boot = ({
	clientId,
	redirectUri,
}: {
	clientId: string
	redirectUri: string
}) => {
	const authManager = new AuthManager({
		clientId,
		redirectUri,
	})

	const history = createBrowserHistory()

	return () => {
		// const storedUser = window.localStorage.getItem(USER_STORE)
		const [user, setUser] = useState<LoggedIn>()
		//(storedUser && JSON.parse(storedUser)) || undefined,
		const [error, setError] = useState<Error>()

		useEffect(() => {
			authManager
				.finalizeLogin()
				.then(res => {
					console.log(res)
					if (res.isLoggedIn) {
						setUser(res)
						window.localStorage.setItem(USER_STORE, JSON.stringify(res))
					} else {
						console.error('Not logged in.')
					}
				})
				.catch(err => {
					console.error(`Login failed: ${err.message}`)
					setError(err)
				})
		}, [authManager])

		return (
			<Router history={history}>
				<GlobalStyle />
				<ToggleNavigation
					loggedIn={user !== undefined}
					onLogout={() => {
						window.localStorage.clear()
						authManager.logout()
					}}
				/>
				{!user && (
					<Login
						onLogin={() => {
							authManager.login()
						}}
					/>
				)}
				{error && <ErrorComponent error={error} />}
				{user && (
					<NavbarBrandContextProvider>
						<ServiceClientCredentialsContext.Provider value={user.creds}>
							<Route exact path="/" render={() => <Redirect to="/cats" />} />
							<Route exact path="/about" component={AboutPage} />
							<Route exact path="/cats" component={CatsPage} />
						</ServiceClientCredentialsContext.Provider>
					</NavbarBrandContextProvider>
				)}
			</Router>
		)
	}
}

const ServiceClientCredentialsContext = React.createContext<
	ServiceClientCredentials
>((undefined as unknown) as ServiceClientCredentials)
export const ServiceClientCredentialsConsumer =
	ServiceClientCredentialsContext.Consumer
