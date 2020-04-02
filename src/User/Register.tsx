import { chain, isRight, left } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import { NonEmptyString } from 'io-ts-types/lib/NonEmptyString'
import React, { useState } from 'react'
import { Button, CardBody, FormGroup, Input, Label } from 'reactstrap'

import { DisplayError as ErrorComponent } from '../Error/Error'
import { FormFooter } from './FormFooter'
import { Email } from './validation/Email'
import { StringEquals } from './validation/StringEquals'

const RegisterInput = t.exact(
	t.type({
		email: Email,
		password: NonEmptyString,
		password2: NonEmptyString,
	}),
)

export const Register = ({
	onRegister,
	error,
	registering,
}: {
	onRegister: (args: { email: string; password: string }) => void
	registering: boolean
	error?: Error
}) => {
	const [input, updateInput] = useState({
		email: '',
		password: '',
		password2: '',
	})

	const isValid = isRight(
		pipe(
			(input => {
				const i = RegisterInput.decode(input)
				if (isRight(i)) {
					return i
				}
				return left(new Error('Validation failed'))
			})(input),
			chain(input => StringEquals(input.password)(input.password2)),
		),
	)

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
						disabled={registering}
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
						disabled={registering}
					/>
				</FormGroup>
				<FormGroup>
					<Label for="password2">Retype password</Label>
					<Input
						type="password"
						name="password2"
						id="password2"
						onChange={({ target: { value } }) => {
							updateInput({
								...input,
								password2: value,
							})
						}}
						disabled={registering}
					/>
				</FormGroup>
			</CardBody>
			<FormFooter>
				<Button
					color="primary"
					disabled={registering || !isValid}
					onClick={() => {
						onRegister(input)
					}}
				>
					{registering ? 'Registering in ...' : 'Register'}
				</Button>
			</FormFooter>
		</>
	)
}
