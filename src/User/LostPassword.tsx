import { isRight } from 'fp-ts/lib/Either'
import * as t from 'io-ts'
import React, { useState } from 'react'
import { Button, CardBody, FormGroup, Input, Label } from 'reactstrap'

import { DisplayError as ErrorComponent } from '../Error/Error'
import { FormFooter } from './FormFooter'
import { Email } from './validation/Email'
import { Success } from '../Success/Success'

const LostPasswordInput = t.exact(
	t.type({
		email: Email,
	}),
)

export const LostPassword = ({
	onLostPassword,
	resetting,
	error,
	success,
}: {
	onLostPassword: (args: { email: string; password: string }) => void
	resetting: boolean
	error?: Error
	success: boolean
}) => {
	const [input, updateInput] = useState({ email: '', password: '' })
	const isValid = isRight(LostPasswordInput.decode(input))

	return (
		<>
			<CardBody>
				{error && <ErrorComponent error={error} />}
				{success && <Success>Password reset instructions sent.</Success>}
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
						disabled={resetting}
					/>
				</FormGroup>
			</CardBody>
			<FormFooter>
				<Button
					color="primary"
					disabled={resetting || !isValid}
					onClick={() => {
						onLostPassword(input)
					}}
				>
					{resetting ? 'Resetting ...' : 'Reset Password'}
				</Button>
			</FormFooter>
		</>
	)
}
