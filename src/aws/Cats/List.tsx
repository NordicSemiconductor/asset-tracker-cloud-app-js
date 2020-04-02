import React, { useEffect, useState } from 'react'
import {
	IotConsumer,
	CredentialsConsumer,
	AthenaConsumer,
	AthenaContext,
} from '../App'
import { Card, CardBody, CardHeader, Table } from 'reactstrap'
import { Iot } from 'aws-sdk'
import { Loading } from '../../Loading/Loading'
import { DisplayError } from '../../Error/Error'
import { Link } from 'react-router-dom'
import { connectAndListenForMessages } from '../connectAndListenForMessages'
import { ICredentials } from '@aws-amplify/core'
import { device } from 'aws-iot-device-sdk'
import { emojify } from '../../Emojify/Emojify'
import styled from 'styled-components'
import { RelativeTime } from '../../RelativeTime/RelativeTime'
import { isAfter } from 'date-fns'
import { athenaQuery, parseAthenaResult } from '@bifravst/athena-helpers'

const Cat = styled.td`
	display: flex;
	justify-content: space-between;
`

const CatWithWarning = styled(Cat)`
	background-color: #ffec8e63;
`

const ClearButton = styled.button`
	border: 0;
	background-color: transparent;
	padding: 0;
	font-size: 80%;
	span {
		margin-right: 0.25rem;
	}
	time {
		opacity: 0.8;
	}
`

type DeviceDateMap = {
	[key: string]: Date
}

const ListCats = ({
	iot,
	credentials,
	athenaContext,
	mqttEndpoint,
	region,
}: {
	iot: Iot
	credentials: ICredentials
	athenaContext: AthenaContext
	region: string
	mqttEndpoint: string
}) => {
	const [loading, setLoading] = useState(true)
	const [cats, setCats] = useState([] as { id: string; name: string }[])
	const [error, setError] = useState<Error>()
	const [buttonSnoozes, setButtonSnoozes] = useState<DeviceDateMap>({})
	const [buttonPresses, setButtonPresses] = useState<DeviceDateMap>({})

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
			.catch(err => {
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
				console.log({
					deviceId,
					btn,
				})
				if (btn) {
					setButtonPresses(presses => ({
						...presses,
						[deviceId]: btn.ts,
					}))
				}
			},
			region,
			mqttEndpoint,
		})
			.then(c => {
				connection = c
			})
			.catch(err => {
				console.error(err)
			})
		return () => {
			isCancelled = true
			if (connection) {
				connection.end()
			}
		}
	}, [iot, credentials, region, mqttEndpoint])

	// Fetch historical button presses
	useEffect(() => {
		let isCancelled = false
		const { athena, workGroup, dataBase, rawDataTable } = athenaContext
		athenaQuery({
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
			.then(async ResultSet => {
				if (isCancelled) return
				const data = parseAthenaResult({
					ResultSet,
					skip: 1,
					formatFields: {
						ts: n => new Date(n),
					},
				})
				setButtonPresses(presses => ({
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
			.catch(error => {
				console.error(error)
			})
		return () => {
			isCancelled = true
		}
	}, [athenaContext])

	// Read/Set localstorage of button snoozes
	useEffect(() => {
		const snoozes = window.localStorage.getItem(`bifravst:catlist:snoozes`)
		if (snoozes) {
			console.log(`Restoring`, JSON.parse(snoozes))
			setButtonSnoozes(
				Object.entries(JSON.parse(snoozes)).reduce(
					(snoozes, [deviceId, ts]) => ({
						...snoozes,
						[deviceId]: new Date(ts as string),
					}),
					{},
				),
			)
		}
	}, [])

	const showButtonWarning = (deviceId: string): boolean => {
		if (!buttonPresses[deviceId]) return false
		if (!buttonSnoozes[deviceId]) return true
		if (isAfter(buttonPresses[deviceId], buttonSnoozes[deviceId])) return true
		return false
	}

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
				<Table>
					<tbody>
						{cats.map(({ id, name }) => {
							const showWarning = showButtonWarning(id)
							const Widget = showWarning ? CatWithWarning : Cat
							return (
								<tr key={id}>
									<Widget>
										<Link to={`/cat/${id}`}>{name}</Link>
										{showWarning && (
											<ClearButton
												title="Click to snooze alarm"
												onClick={() => {
													setButtonSnoozes(snoozes => {
														const u = {
															...snoozes,
															[id]: new Date(),
														}
														console.log(`Storing`, JSON.stringify(u))
														window.localStorage.setItem(
															`bifravst:catlist:snoozes`,
															JSON.stringify(u),
														)
														return u
													})
												}}
											>
												{emojify('🔴')}
												<RelativeTime ts={buttonPresses[id]} />
											</ClearButton>
										)}
									</Widget>
								</tr>
							)
						})}
					</tbody>
				</Table>
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
		{athenaContext => (
			<CredentialsConsumer>
				{credentials => (
					<IotConsumer>
						{({ iot, mqttEndpoint, region }) => (
							<ListCats
								{...{ athenaContext, iot, credentials, mqttEndpoint, region }}
							/>
						)}
					</IotConsumer>
				)}
			</CredentialsConsumer>
		)}
	</AthenaConsumer>
)
