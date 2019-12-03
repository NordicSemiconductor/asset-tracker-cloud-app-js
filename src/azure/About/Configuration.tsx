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
				<dt>App client id</dt>
				<dd>
					<code>{process.env.REACT_APP_AZURE_CLIENT_ID}</code>
				</dd>
			</dl>
		</CardBody>
	</Card>
)
