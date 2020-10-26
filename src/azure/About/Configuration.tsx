import React from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { SolutionConfigContextType } from '../App'

export const Configuration = ({
	config,
}: {
	config: SolutionConfigContextType
}) => (
	<Card data-intro="This card shows the apps' configuration.">
		<CardHeader>Environment</CardHeader>
		<CardBody>
			<dl>
				<dt>App client id</dt>
				<dd>
					<code>{config.clientId}</code>
				</dd>
				<dt>API Endpoint</dt>
				<dd>
					<code>{config.apiEndpoint}</code>
				</dd>
			</dl>
		</CardBody>
	</Card>
)
