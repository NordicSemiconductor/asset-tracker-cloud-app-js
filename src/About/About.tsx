import React from 'react'
import { Button, Card, CardBody, CardHeader } from 'reactstrap'
import { Cache } from 'aws-amplify'
import { IdentityIdConsumer } from '../App'

export const About = () => (
	<Card>
		<CardHeader>About</CardHeader>
		<CardBody>
			<p>
				This is the web application of <em>Bifravst</em> which aims to provide a
				concrete end-to-end sample for an IoT product in the asset tracker
				space, a Cat Tracker. You can find the source code on{' '}
				<a href={'https://github.com/bifravst'} target={'_blank'}>
					GitHub
				</a>
				.
			</p>
			<p>
				Please also consider the{' '}
				<a href={'https://bifravst.github.io/'} target={'_blank'}>
					Bifravst handbook
				</a>
				.
			</p>
			<dl>
				<dt>Version</dt>
				<dd>
					<code>{process.env.REACT_APP_VERSION || '0.0.0-development'}</code>
				</dd>
			</dl>
			<h3>Cognito</h3>
			<dl>
				<dt>User</dt>
				<dd>
					<IdentityIdConsumer>{identityId => identityId}</IdentityIdConsumer>
				</dd>
				<dt>User Pool</dt>
				<dd>
					<a
						href={`https://${process.env.REACT_APP_REGION}.console.aws.amazon.com/cognito/users/?region=${process.env.REACT_APP_REGION}#/pool/${process.env.REACT_APP_USER_POOL_ID}`}
					>
						<code>{process.env.REACT_APP_USER_POOL_ID}</code>
					</a>{' '}
				</dd>
				<dt>User Pool Client ID</dt>
				<dd>
					<code>{process.env.REACT_APP_USER_POOL_CLIENT_ID}</code>
				</dd>
			</dl>
			<h3>Iot</h3>
			<dl>
				<dt>MQTT Endpoint</dt>
				<dd>
					<code>{process.env.REACT_APP_MQTT_ENDPOINT}</code>
				</dd>
			</dl>
			<h3>Athena</h3>
			<dl>
				<dt>Work Group</dt>
				<dd>
					<code>{process.env.REACT_APP_HISTORICALDATA_WORKGROUP_NAME}</code>
				</dd>
				<dt>Database</dt>
				<dd>
					<code>{process.env.REACT_APP_HISTORICALDATA_DATABASE_NAME}</code>
				</dd>
				<dt>Table</dt>
				<dd>
					<code>{process.env.REACT_APP_HISTORICALDATA_TABLE_NAME}</code>
				</dd>
			</dl>
			<h3>S3</h3>
			<dl>
				<dt>Avatars</dt>
				<dd>
					<a
						href={`https://s3.console.aws.amazon.com/s3/buckets/${process.env.REACT_APP_AVATAR_BUCKET_NAME}/?region=${process.env.REACT_APP_REGION}&tab=overview`}
					>
						<code>{process.env.REACT_APP_AVATAR_BUCKET_NAME}</code>
					</a>
				</dd>
				<dt>DFU</dt>
				<dd>
					<a
						href={`https://s3.console.aws.amazon.com/s3/buckets/${process.env.REACT_APP_DFU_BUCKET_NAME}/?region=${process.env.REACT_APP_REGION}&tab=overview`}
					>
						<code>{process.env.REACT_APP_DFU_BUCKET_NAME}</code>
					</a>
				</dd>
			</dl>
			<hr />
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
