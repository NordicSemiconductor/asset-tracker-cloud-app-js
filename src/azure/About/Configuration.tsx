import React from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'

export const Configuration = () => (
	<Card data-intro="This card lists the apps configuration.">
		<CardHeader>Environment</CardHeader>
		<CardBody>
			<dl>
				<dt>App client id</dt>
				<dd>
					<code>{process.env.REACT_APP_AZURE_CLIENT_ID}</code>
				</dd>
			</dl>
		</CardBody>
	</Card>
)
