import * as firebase from 'firebase/app'
import React, { useState, useRef, useEffect } from 'react'

import { Login } from '../User/Login'
import { LostPassword } from '../User/LostPassword'
import { Register } from '../User/Register'
import { UserPanelSwitcher } from '../User/UserPanelSwitcher'

export const FirebaseUserPanel = () => {
	const [loggingIn, setLoggingIn] = useState(false)
	const [loginError, setLoginError] = useState<Error>()
	const [resetting, setResetting] = useState(false)
	const [resetSuccess, setResetSuccess] = useState(false)
	const [resetError, setResetError] = useState<Error>()
	const [registering, setRegistering] = useState(false)
	const [registerError, setRegisterError] = useState<Error>()

	const mounted = useRef(true)
	useEffect(
		() => () => {
			mounted.current = false
		},
		[],
	)

	return (
		<UserPanelSwitcher>
			{{
				login: {
					title: 'Log-in',
					child: (
						<Login
							loggingIn={loggingIn}
							error={loginError}
							onLogin={async ({ email, password }) => {
								try {
									console.log(`Logging in ${email} ...`)
									setLoggingIn(true)
									setLoginError(undefined)
									await firebase
										.auth()
										.signInWithEmailAndPassword(email, password)
								} catch (error) {
									if (mounted.current) setLoginError(error)
								} finally {
									if (mounted.current) setLoggingIn(false)
								}
							}}
						/>
					),
				},
				lostPassword: {
					title: 'Lost Password',
					child: (
						<LostPassword
							resetting={resetting}
							error={resetError}
							success={resetSuccess}
							onLostPassword={async ({ email }) => {
								try {
									console.log(`Resetting password for ${email} ...`)
									setResetting(true)
									setResetError(undefined)
									await firebase.auth().sendPasswordResetEmail(email)
									if (mounted.current) setResetSuccess(true)
								} catch (error) {
									if (mounted.current) setResetError(error)
								} finally {
									if (mounted.current) setResetting(false)
								}
							}}
						/>
					),
				},
				register: {
					title: 'Register',
					child: (
						<Register
							registering={registering}
							error={registerError}
							onRegister={async ({ email, password }) => {
								try {
									console.log(`Registering ${email} ...`)
									await firebase
										.auth()
										.createUserWithEmailAndPassword(email, password)
								} catch (error) {
									if (mounted.current) setRegisterError(error)
								} finally {
									if (mounted.current) setRegistering(false)
								}
							}}
						/>
					),
				},
			}}
		</UserPanelSwitcher>
	)
}
