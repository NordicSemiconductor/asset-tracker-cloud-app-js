import 'firebase/auth'

import * as firebase from 'firebase/app'
import { createBrowserHistory } from 'history'
import React, { useState } from 'react'
import { Redirect, Route, Router } from 'react-router-dom'

import { NavbarBrandContextProvider } from '../Navigation/NavbarBrand'
import { ToggleNavigation } from '../Navigation/ToggleNavigation'
import { GlobalStyle } from '../Styles'
import { FirebaseUserPanel } from './FirebaseUserPanel'
import { VerifyUserEmail } from './VerifyUserEmail'
import { AboutPage } from './About/Page'

export type CloudConfigContext = {
	firebaseAuthDomain: string
}

export const boot = ({
	apiKey,
	authDomain,
}: {
	apiKey: string
	authDomain: string
}) => {
	firebase.initializeApp({
		apiKey,
		authDomain,
	})

	const history = createBrowserHistory()

	const auth = firebase.auth()

	return () => {
		const [user, setUser] = useState<firebase.User>()

		auth.onAuthStateChanged(user => {
			if (user !== null) {
				setUser(user)
			}
		})

		return (
			<CloudConfigContext.Provider
				value={{
					firebaseAuthDomain: authDomain,
				}}
			>
				<Router history={history}>
					<GlobalStyle />
					<ToggleNavigation
						loggedIn={user !== undefined}
						onLogout={() => {
							auth
								.signOut()
								.then(() => {
									window.location.reload()
								})
								.catch(error => {
									// Woot?!
									console.error(error)
								})
						}}
					/>
					{!user && <FirebaseUserPanel />}
					{user && (
						<NavbarBrandContextProvider>
							<IdentityIdContext.Provider value={user.uid}>
								<VerifyUserEmail user={user} />
								<Route exact path="/" render={() => <Redirect to="/cats" />} />
								<Route exact path="/about" component={AboutPage} />
							</IdentityIdContext.Provider>
						</NavbarBrandContextProvider>
					)}
				</Router>
			</CloudConfigContext.Provider>
		)
	}
}

const IdentityIdContext = React.createContext<string>('unauthorized')
export const IdentityIdConsumer = IdentityIdContext.Consumer

const CloudConfigContext = React.createContext<CloudConfigContext>({
	firebaseAuthDomain: '',
})
export const CloudConfigConsumer = CloudConfigContext.Consumer
