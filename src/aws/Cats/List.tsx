import React, { useEffect, useState } from 'react'
import {
	IotConsumer,
	CredentialsConsumer,
	AthenaConsumer,
	AthenaContext,
} from '../App'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { Iot } from 'aws-sdk'
import { Loading } from '../../Loading/Loading'
import { DisplayError } from '../../Error/Error'
import { connectAndListenForMessages } from '../connectAndListenForMessages'
import { ICredentials } from '@aws-amplify/core'
import { device } from 'aws-iot-device-sdk'
import { query, parseResult } from '@bifravst/athena-helpers'
import {
	ButtonWarnings,
	DeviceDateMap,
	ButtonWarningProps,
} from '../../ButtonWarnings/ButtonWarnings'
import { CatList } from '../../CatList/CatList'

const ListCats = ({
	iot,
	credentials,
	athenaContext,
	mqttEndpoint,
	region,
	showButtonWarning,
	snooze,
	setButtonPresses,
}: {
	iot: Iot
	credentials: ICredentials
	athenaContext: AthenaContext
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
					(things || []).map(({ thingName, attributes }) => ({
						id: thingName || 'unknown',
						name: (attributes && attributes.name) || thingName || 'unknown',
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
			if (connection) {
				connection.end()
			}
		}
	}, [iot, credentials, region, mqttEndpoint, setButtonPresses])

	// Fetch historical button presses
	useEffect(() => {
		let isCancelled = false
		const { athena, workGroup, dataBase, rawDataTable } = athenaContext
		query({
			WorkGroup: workGroup,
			athena,
			debugLog: (...args: any) => {
				console.debug('[athena]', ...args)
			},
			errorLog: (...args: any) => {
				console.error('[athena]', ...args)
			},
		})({
			QueryString: `		
				SELECT m.message.btn.v as button, 
						m.message.btn.ts as ts,
						m.timestamp,
						m.deviceid
				FROM (
					SELECT deviceid,
						MAX(timestamp) AS max_timestamp
				FROM ${dataBase}.${rawDataTable} t
				WHERE t.message.btn IS NOT NULL
				GROUP BY 1 
					) t JOIN ${dataBase}.${rawDataTable} m ON m.timestamp = t.max_timestamp AND m.deviceid = t.deviceid
				`,
		})
			.then(async (ResultSet) => {
				if (isCancelled) return
				const data = parseResult({
					ResultSet,
					skip: 1,
					formatFields: {
						ts: (n) => new Date(n),
					},
				})
				setButtonPresses((presses) => ({
					...data.reduce(
						(p, { deviceid, ts }) => ({
							...p,
							[deviceid as string]: (ts as unknown) as Date,
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
	}, [athenaContext, setButtonPresses])

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
	<AthenaConsumer>
		{(athenaContext) => (
			<CredentialsConsumer>
				{(credentials) => (
					<IotConsumer>
						{({ iot, mqttEndpoint, region }) => (
							<ButtonWarnings>
								{(buttonWarningProps) => (
									<ListCats
										{...{
											athenaContext,
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
	</AthenaConsumer>
)
