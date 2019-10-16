import React from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { IdentityIdConsumer } from '../App'

export const Configuration = () => (
	<Card data-intro="This card lists the apps configuration.">
		<CardHeader>Environment</CardHeader>
		<CardBody>
			<dl>
				<dt>User</dt>
				<dd>
					<IdentityIdConsumer>
						{identityId => <code>{identityId}</code>}
					</IdentityIdConsumer>
				</dd>
				<dt>Firebase Auth Domain</dt>
				<dd>
					<code>{process.env.REACT_APP_FIREBASE_AUTH_DOMAIN}</code>
				</dd>
			</dl>
		</CardBody>
	</Card>
)
