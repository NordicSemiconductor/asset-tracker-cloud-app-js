import React, { useEffect, useState } from 'react'
import {
	IotConsumer,
	CredentialsConsumer,
	TimestreamQueryConsumer,
	TimestreamQueryContextType,
} from '../App'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { Iot } from 'aws-sdk'
import { Loading } from '../../Loading/Loading'
import { DisplayError } from '../../Error/Error'
import { connectAndListenForMessages } from '../connectAndListenForMessages'
import { ICredentials } from '@aws-amplify/core'
import { device } from 'aws-iot-device-sdk'
import { parseResult } from '@bifravst/timestream-helpers'
import {
	ButtonWarnings,
	DeviceDateMap,
	ButtonWarningProps,
} from '../../ButtonWarnings/ButtonWarnings'
import { CatList } from '../../CatList/CatList'

const ListCats = ({
	iot,
	credentials,
	timestreamQueryContext,
	mqttEndpoint,
	region,
	showButtonWarning,
	snooze,
	setButtonPresses,
}: {
	iot: Iot
	credentials: ICredentials
	timestreamQueryContext: TimestreamQueryContextType
	region: string
	mqttEndpoint: string
} & ButtonWarningProps) => {
	const [loading, setLoading] = useState(true)
	const [cats, setCats] = useState([] as { id: string; name: string }[])
	const [error, setError] = useState<Error>()

	// Fetch list of devices
	useEffect(() => {
		let isCancelled = false
		iot
			.listThings()
			.promise()
			.then(({ things }) => {
				if (isCancelled) return
				setCats(
					(things ?? []).map(({ thingName, attributes }) => ({
						id: thingName ?? 'unknown',
						name: attributes?.name ?? thingName ?? 'unknown',
					})),
				)
				setLoading(false)
			})
			.catch((err) => {
				if (isCancelled) return
				setError(err)
				setLoading(false)
			})
		return () => {
			isCancelled = true
		}
	}, [iot])

	// Set up IoT subscription to listen for button presses
	useEffect(() => {
		let connection: device
		let isCancelled = false
		connectAndListenForMessages({
			clientId: `user-${credentials.identityId}-${Date.now()}`,
			credentials,
			onMessage: ({ deviceId, message: { btn } }) => {
				if (isCancelled) return
				if (btn) {
					setButtonPresses((presses) => ({
						...presses,
						[deviceId]: btn.ts,
					}))
				}
			},
			region,
			mqttEndpoint,
		})
			.then((c) => {
				connection = c
			})
			.catch((err) => {
				console.error(err)
			})
		return () => {
			isCancelled = true

			connection?.end()
		}
	}, [iot, credentials, region, mqttEndpoint, setButtonPresses])

	// Fetch historical button presses
	useEffect(() => {
		let isCancelled = false
		const { timestreamQuery, db, table } = timestreamQueryContext
		timestreamQuery
			.query({
				QueryString: `SELECT
			m.measure_value::double as button, 
			m.time as ts,
			m.deviceId
			FROM (
				SELECT deviceId,
				MAX(time) AS max_time
				FROM "${db}"."${table}" 
				WHERE measure_name='btn'
				GROUP BY 1 
			) t JOIN "${db}"."${table}" m ON m.time = t.max_time AND m.deviceId = t.deviceId`,
			})
			.promise()
			.then((result) =>
				parseResult<{
					button: number
					ts: Date
					deviceId: string
				}>(result),
			)
			.then((data) => {
				if (isCancelled) return
				setButtonPresses((presses) => ({
					...data.reduce(
						(p, { deviceId, ts }) => ({
							...p,
							[deviceId]: (ts as unknown) as Date,
						}),
						{} as DeviceDateMap,
					),
					...presses,
				}))
				console.debug('[Button Presses]', data)
			})
			.catch((error) => {
				console.error(error)
			})
		return () => {
			isCancelled = true
		}
	}, [timestreamQueryContext, setButtonPresses])

	if (loading || error)
		return (
			<Card>
				<CardBody>
					{loading && <Loading text={'Herding cats...'} />}
					{error && <DisplayError error={error} />}
				</CardBody>
			</Card>
		)
	return (
		<Card data-intro="This lists your cats. Click on one to see its details.">
			<CardHeader>Cats</CardHeader>
			{cats.length > 0 && (
				<CatList {...{ showButtonWarning, snooze, setButtonPresses, cats }} />
			)}
			{!cats.length && (
				<CardBody>
					No cats, yet. Read more about how to create{' '}
					<em>Device Credentials</em> for your cat trackers{' '}
					<a
						href={'https://bifravst.github.io/'}
						target="_blank"
						rel="noopener noreferrer"
					>
						in the handbook
					</a>
					.
				</CardBody>
			)}
		</Card>
	)
}

export const List = () => (
	<TimestreamQueryConsumer>
		{(timestreamQueryContext) => (
			<CredentialsConsumer>
				{(credentials) => (
					<IotConsumer>
						{({ iot, mqttEndpoint, region }) => (
							<ButtonWarnings>
								{(buttonWarningProps) => (
									<ListCats
										{...{
											timestreamQueryContext,
											iot,
											credentials,
											mqttEndpoint,
											region,
											...buttonWarningProps,
										}}
									/>
								)}
							</ButtonWarnings>
						)}
					</IotConsumer>
				)}
			</CredentialsConsumer>
		)}
	</TimestreamQueryConsumer>
)
