import React from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { IdentityIdConsumer, CloudConfigContext } from '../App'

export const Configuration = ({ config }: { config: CloudConfigContext }) => (
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
					<code>{config.firebaseAuthDomain}</code>
				</dd>
			</dl>
		</CardBody>
	</Card>
)
