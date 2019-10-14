import * as firebase from 'firebase/app'
import React, { useState } from 'react'
import { Alert, Button } from 'reactstrap'
import styled from 'styled-components'
import { Success } from '../Success/Success'
import { Error as ErrorComponent } from '../Error/Error'

const Info = styled(Alert)`
	display: flex;
	justify-content: space-between;
	align-items: center;
`

export const VerifyUserEmail = ({ user }: { user: firebase.User }) => {
	const [done, setDone] = useState(false)
	const [error, setError] = useState<Error>()

	if (user.emailVerified) return null
	if (done) return <Success>Great! Please check you mail.</Success>
	if (error) return <ErrorComponent error={error} />

	return (
		<Info color={'warning'}>
			<span>
				Your email address <code>{user.email}</code> needs to be verified:
			</span>{' '}
			<Button
				color={'secondary'}
				outline
				onClick={() => {
					user
						.sendEmailVerification()
						.then(() => {
							setDone(true)
						})
						.catch(setError)
				}}
			>
				Send a verification email
			</Button>
		</Info>
	)
}
