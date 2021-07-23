import React from 'react'
import { StackConfigContextType } from '../../../../aws/App'
import { DLCard } from '../../DLCard'

export const Configuration = ({
	config,
}: {
	config: StackConfigContextType
}) => (
	<DLCard
		title="Environment"
		intro="This card shows the apps' configuration."
		entries={{
			Region: <code>{config.region}</code>,
			'User Pool': (
				<a
					href={`https://${config.region}.console.aws.amazon.com/cognito/users/?region=${config.region}#/pool/${config.userPoolId}`}
				>
					<code>{config.userPoolId}</code>
				</a>
			),
			'User Pool Client ID': <code>{config.userPoolClientId}</code>,
			'MQTT Endpoint': <code>{config.mqttEndpoint}</code>,
			'Historical Data Storage': (
				<a
					href={`https://${config.region}.console.aws.amazon.com/timestream/home?region=${config.region}#databases/${config.timestreamConfig.db}/tables/${config.timestreamConfig.table}`}
				>
					<code>
						{config.timestreamConfig.db}.{config.timestreamConfig.table}
					</code>
				</a>
			),
			'Avatar Storage': (
				<a
					href={`https://s3.console.aws.amazon.com/s3/buckets/${config.avatarBucketName}/?region=${config.region}&tab=overview`}
					target="_blank"
					rel="noopener noreferrer"
				>
					<code>{config.avatarBucketName}</code>
				</a>
			),
			'FOTA Storage': (
				<a
					href={`https://s3.console.aws.amazon.com/s3/buckets/${config.fotaBucketName}/?region=${config.region}&tab=overview`}
					target="_blank"
					rel="noopener noreferrer"
				>
					<code>{config.fotaBucketName}</code>
				</a>
			),
		}}
	/>
)
