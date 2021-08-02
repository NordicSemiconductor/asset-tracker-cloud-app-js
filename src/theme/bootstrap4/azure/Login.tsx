import React from 'react'
import {
	Button,
	CardHeader,
	CardBody,
	Card,
	Form,
	CardFooter,
} from 'reactstrap'
import { Main } from '../../../Styles'
import styled from 'styled-components'

const FormFooter = styled(CardFooter)`
	display: flex;
	align-items: flex-end;
	flex-direction: column;
`

export class Login<P extends { onLogin: () => void }> extends React.Component<
	P,
	{ loggingIn: boolean }
> {
	constructor(props: Readonly<P>) {
		super(props)
		this.state = { loggingIn: false }
	}

	render() {
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
								disabled={this.state.loggingIn}
								onClick={() => {
									this.setState({ loggingIn: true })
									this.props.onLogin()
								}}
							>
								{this.state.loggingIn
									? 'Logging in ...'
									: 'Log in (opens in a pop-up)'}
							</Button>
						</FormFooter>
					</Card>
				</Form>
			</Main>
		)
	}
}
