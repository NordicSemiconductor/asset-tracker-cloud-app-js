import { isRight } from 'fp-ts/lib/Either'
import * as t from 'io-ts'
import { NonEmptyString } from 'io-ts-types/lib/NonEmptyString'
import React, { useState } from 'react'
import { Button, CardBody, FormGroup, Input, Label } from 'reactstrap'

import { Error as ErrorComponent } from '../Error/Error'
import { FormFooter } from './FormFooter'
import { Email } from './validation/Email'

const LoginInput = t.exact(
	t.type({
		email: Email,
		password: NonEmptyString,
	}),
)

export const Login = ({
	onLogin,
	loggingIn,
	error,
}: {
	onLogin: (args: { email: string; password: string }) => void
	loggingIn: boolean
	error?: Error
}) => {
	const [input, updateInput] = useState({ email: '', password: '' })
	const isValid = isRight(LoginInput.decode(input))

	return (
		<>
			<CardBody>
				{error && <ErrorComponent error={error} />}
				<FormGroup>
					<Label for="email">Email</Label>
					<Input
						type="email"
						name="email"
						id="email"
						placeholder='e.g. "alex@example.com"'
						onChange={({ target: { value } }) => {
							updateInput({
								...input,
								email: value,
							})
						}}
						disabled={loggingIn}
					/>
				</FormGroup>
				<FormGroup>
					<Label for="password">Password</Label>
					<Input
						type="password"
						name="password"
						id="password"
						onChange={({ target: { value } }) => {
							updateInput({
								...input,
								password: value,
							})
						}}
						disabled={loggingIn}
					/>
				</FormGroup>
			</CardBody>
			<FormFooter>
				<Button
					color="primary"
					disabled={loggingIn || !isValid}
					onClick={() => {
						onLogin(input)
					}}
				>
					{loggingIn ? 'Logging in ...' : 'Login'}
				</Button>
			</FormFooter>
		</>
	)
}
