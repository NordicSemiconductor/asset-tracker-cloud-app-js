import React from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { IdentityIdConsumer, StackConfigContext } from '../App'

export const Configuration = ({ config }: { config: StackConfigContext }) => (
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
				<dt>User Pool</dt>
				<dd>
					<a
						href={`https://${config.region}.console.aws.amazon.com/cognito/users/?region=${config.region}#/pool/${config.userPoolId}`}
					>
						<code>{config.userPoolId}</code>
					</a>{' '}
				</dd>
				<dt>User Pool Client ID</dt>
				<dd>
					<code>{config.userPoolClientId}</code>
				</dd>
				<dt>MQTT Endpoint</dt>
				<dd>
					<code>{config.mqttEndpoint}</code>
				</dd>
				<dt>Historical Data Storage</dt>
				<dd>
					<a
						href={`https://s3.console.aws.amazon.com/s3/buckets/${config.athenaConfig.bucketName}/?region=${config.region}&tab=overview`}
					>
						<code>{config.athenaConfig.bucketName}</code>
					</a>
				</dd>
				<dt>Athena Work Group</dt>
				<dd>
					<code>{config.athenaConfig.workGroup}</code>
				</dd>
				<dt>Athena Database</dt>
				<dd>
					<code>{config.athenaConfig.dataBase}</code>
				</dd>
				<dt>Athena Table</dt>
				<dd>
					<code>{config.athenaConfig.rawDataTable}</code>
				</dd>
				<dt>Avatar Storage</dt>
				<dd>
					<a
						href={`https://s3.console.aws.amazon.com/s3/buckets/${config.avatarBucketName}/?region=${config.region}&tab=overview`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<code>{config.avatarBucketName}</code>
					</a>
				</dd>
				<dt>FOTA Storage</dt>
				<dd>
					<a
						href={`https://s3.console.aws.amazon.com/s3/buckets/${config.fotaBucketName}/?region=${config.region}&tab=overview`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<code>{config.fotaBucketName}</code>
					</a>
				</dd>
			</dl>
		</CardBody>
	</Card>
)
