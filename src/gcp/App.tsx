import 'firebase/auth'

import * as firebase from 'firebase/app'
import React, { useState } from 'react'
import { Redirect, Route, Router } from 'react-router-dom'
import { createBrowserHistory } from 'history'

import { NavbarBrandContextProvider } from '../Navigation/NavbarBrand'
import { ToggleNavigation } from '../Navigation/ToggleNavigation'
import { GlobalStyle } from '../Styles'
import { FirebaseUserPanel } from './FirebaseUserPanel'
import { VerifyUserEmail } from './VerifyUserEmail'

const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
} as const

firebase.initializeApp(firebaseConfig)

const history = createBrowserHistory()

const IdentityIdContext = React.createContext<string>('unauthorized')
export const IdentityIdConsumer = IdentityIdContext.Consumer

export type ICredentials = {
	authenticated: boolean
}
const CredentialsContext = React.createContext<ICredentials>({
	authenticated: false,
})
export const CredentialsConsumer = CredentialsContext.Consumer

const auth = firebase.auth()

const App = () => {
	const [user, setUser] = useState<firebase.User>()

	auth.onAuthStateChanged(user => {
		if (user !== null) {
			setUser(user)
		}
	})

	return (
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
					<VerifyUserEmail user={user} />
					<Route exact path="/" render={() => <Redirect to="/cats" />} />
				</NavbarBrandContextProvider>
			)}
		</Router>
	)
}

export default App
