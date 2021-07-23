import React, { useEffect, useState } from 'react'
import {
	IotConsumer,
	CredentialsConsumer,
	TimestreamQueryConsumer,
	TimestreamQueryContextType,
} from '../App'
import {
	IoTClient,
	ListThingsCommand,
	ThingAttribute,
} from '@aws-sdk/client-iot'
import { connectAndListenForMessages } from '../connectAndListenForMessages'
import { ICredentials } from '@aws-amplify/core'
import { device } from 'aws-iot-device-sdk'
import {
	ButtonWarnings,
	DeviceDateMap,
	ButtonWarningProps,
} from '../../ButtonWarnings/ButtonWarnings'

const fetchPaginated =
	({
		iot,
		items,
		limit,
	}: {
		iot: IoTClient
		items?: ThingAttribute[]
		limit?: number
	}) =>
	async (args?: { startKey?: string }): Promise<ThingAttribute[]> => {
		const { things, nextToken } = await iot.send(
			new ListThingsCommand({
				nextToken: args?.startKey,
			}),
		)
		if (things === undefined) return items ?? []
		const newItems = [...(items ?? []), ...things]
		if (nextToken === undefined) return newItems
		if (newItems.length > (limit ?? 100)) return newItems
		return fetchPaginated({
			iot,
			items: newItems,
			limit,
		})({ startKey: nextToken })
	}
type Cat = { id: string; name: string; labels?: string[]; isTest: boolean }
const ListCats = ({
	iot,
	credentials,
	timestreamQueryContext,
	mqttEndpoint,
	region,
	showButtonWarning,
	snooze,
	setButtonPresses,
	renderLoading,
	renderError,
	render,
}: {
	iot: IoTClient
	credentials: ICredentials
	timestreamQueryContext: TimestreamQueryContextType
	region: string
	mqttEndpoint: string
	renderLoading: () => JSX.Element
	renderError: (args: { error: Error }) => JSX.Element
	render: (args: { cats: Cat[] } & ButtonWarningProps) => JSX.Element
} & ButtonWarningProps) => {
	const [loading, setLoading] = useState(true)
	const [cats, setCats] = useState([] as Cat[])
	const [error, setError] = useState<Error>()

	// Fetch list of devices
	useEffect(() => {
		let isCancelled = false
		fetchPaginated({ iot })()
			.then((things) => {
				if (isCancelled) return
				setCats((cats) => [
					...cats,
					...(things ?? []).map(({ thingName, attributes }) => ({
						id: thingName ?? 'unknown',
						name: attributes?.name ?? thingName ?? 'unknown',
						labels: Object.entries(attributes ?? {})
							.filter(([name]) => name !== 'name')
							.map(([name, value]) => `${name}:${value}`),
						isTest: attributes?.test !== undefined,
					})),
				])
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
							[deviceId]: ts as unknown as Date,
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

	if (loading) return renderLoading()
	if (error) return renderError({ error })
	return render({ cats, showButtonWarning, snooze, setButtonPresses })
}

export const List = ({
	renderLoading,
	renderError,
	render,
}: {
	renderLoading: () => JSX.Element
	renderError: (args: { error: Error }) => JSX.Element
	render: (args: { cats: Cat[] } & ButtonWarningProps) => JSX.Element
}) => (
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
											renderLoading,
											renderError,
											render,
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
