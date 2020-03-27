import React, { useState } from 'react'
import { Button, CardHeader, CardBody, Card, Form } from 'reactstrap'
import { FormFooter } from '../User/FormFooter'
import { Main } from '../Styles'

export const Login = ({ onLogin }: { onLogin: () => void }) => {
	const [loggingIn, setLoggingIn] = useState<boolean>(false)
	return (
		<Main>
			<Form>
				<Card>
					<CardHeader>Please log in!</CardHeader>
					<CardBody>
						<p>In order to use this application, please log in:</p>
					</CardBody>
					<FormFooter>
						<Button
							color="primary"
							disabled={loggingIn}
							onClick={() => {
								setLoggingIn(true)
								onLogin()
							}}
						>
							{loggingIn ? 'Logging in ...' : 'Log in (opens in a pop-up)'}
						</Button>
					</FormFooter>
				</Card>
			</Form>
		</Main>
	)
}
