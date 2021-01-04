import React, { useEffect, useState } from 'react'
import {
	IotConsumer,
	CredentialsConsumer,
	TimestreamQueryConsumer,
	TimestreamQueryContextType,
} from '../App'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { IoTClient, ListThingsCommand } from '@aws-sdk/client-iot'
import { Loading } from '../../Loading/Loading'
import { DisplayError } from '../../Error/Error'
import { connectAndListenForMessages } from '../connectAndListenForMessages'
import { ICredentials } from '@aws-amplify/core'
import { device } from 'aws-iot-device-sdk'
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
	iot: IoTClient
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
			.send(new ListThingsCommand({}))
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
		timestreamQueryContext
			.query<{
				button: number
				ts: Date
				deviceId: string
			}>(
				(table) => `SELECT
			m.measure_value::double as button, 
			m.time as ts,
			m.deviceId
			FROM (
				SELECT deviceId,
				MAX(time) AS max_time
				FROM ${table}
				WHERE measure_name='btn'
				GROUP BY 1 
			) t JOIN ${table} m ON m.time = t.max_time AND m.deviceId = t.deviceId`,
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
