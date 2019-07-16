import React from 'react'
import { Button, Card, CardBody, CardHeader } from 'reactstrap'
import { Cache } from 'aws-amplify'
import { AuthDataContext } from '../App'

export const About = () => (
	<Card>
		<CardHeader>About</CardHeader>
		<CardBody>
			<dl>
				<dt>User</dt>
				<dd>
					<AuthDataContext.Consumer>
						{({ identityId }) => identityId}
					</AuthDataContext.Consumer>
				</dd>
			</dl>
			<hr/>
			<p>
				<Button
					outline
					color="danger"
					onClick={() => {
						Cache.clear()
					}}
				>
					Clear app cache
				</Button>
			</p>
		</CardBody>
	</Card>
)
