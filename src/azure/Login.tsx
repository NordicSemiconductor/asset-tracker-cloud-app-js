import { useState } from 'react'
import { Button, Card, CardBody, CardHeader, Form } from 'reactstrap'
import { Main } from '../Styles'
import { FormFooter } from '../User/FormFooter'

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
