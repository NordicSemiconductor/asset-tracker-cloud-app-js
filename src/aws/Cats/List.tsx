import React, { useEffect, useState } from 'react'
import { IotConsumer, CredentialsConsumer } from '../App'
import { Card, CardBody, CardHeader, Table } from 'reactstrap'
import { Iot } from 'aws-sdk'
import { Loading } from '../../Loading/Loading'
import { Error } from '../../Error/Error'
import { Link } from 'react-router-dom'
import { connectAndListenForMessages } from '../connectAndListenForMessages'
import { IdentityIdConsumer } from '../../gcp/App'
import { ICredentials } from '@aws-amplify/core'
import { device } from 'aws-iot-device-sdk'
import { emojify } from '../../Emojify/Emojify'
import styled from 'styled-components'
import { RelativeTime } from '../../RelativeTime/RelativeTime'

const Cat = styled.td`
	display: flex;
	justify-content: space-between;
	&.buttonPressed {
		background-color: #ffec8e63;
	}
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

const ListCats = ({
	iot,
	credentials,
	identityId,
}: {
	iot: Iot
	credentials: ICredentials
	identityId: string
}) => {
	const [loading, setLoading] = useState(true)
	const [cats, setCats] = useState([] as { id: string; name: string }[])
	const [error, setError] = useState<Error>()
	const [buttonPresses, setButtonPresses] = useState<{
		[key: string]: Date
	}>({})
	useEffect(() => {
		iot
			.listThings()
			.promise()
			.then(({ things }) => {
				setCats(
					(things || []).map(({ thingName, attributes }) => ({
						id: thingName || 'unknown',
						name: (attributes && attributes.name) || thingName || 'unknown',
					})),
				)
				setLoading(false)
			})
			.catch(err => {
				setError(err)
				setLoading(false)
			})
	}, [iot])

	useEffect(() => {
		let connection: device
		connectAndListenForMessages({
			clientId: `user-${identityId}-${Date.now()}`,
			credentials,
			onMessage: ({ deviceId, message: { btn } }) => {
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
		})
			.then(c => {
				connection = c
			})
			.catch(err => {
				console.error(err)
			})
		return () => {
			if (connection) {
				connection.end()
			}
		}
	}, [iot, credentials, identityId])

	if (loading || error)
		return (
			<Card>
				<CardBody>
					{loading && <Loading text={'Herding cats...'} />}
					{error && <Error error={error} />}
				</CardBody>
			</Card>
		)
	return (
		<Card data-intro="This lists your cats. Click on one to see its details.">
			<CardHeader>Cats</CardHeader>
			{cats.length > 0 && (
				<Table>
					<tbody>
						{cats.map(({ id, name }) => (
							<tr key={id}>
								<Cat className={buttonPresses[id] && 'buttonPressed'}>
									<Link to={`/cat/${id}`}>{name}</Link>
									{buttonPresses[id] && (
										<ClearButton
											onClick={() => {
												setButtonPresses(buttonPresses => {
													const {
														[id]: _,
														...buttonPressesWithoutId
													} = buttonPresses
													return buttonPressesWithoutId
												})
											}}
										>
											{emojify('🔴')}
											<RelativeTime ts={buttonPresses[id]} />
										</ClearButton>
									)}
								</Cat>
							</tr>
						))}
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
	<CredentialsConsumer>
		{credentials => (
			<IdentityIdConsumer>
				{identityId => (
					<IotConsumer>
						{({ iot }) => (
							<ListCats
								iot={iot}
								credentials={credentials}
								identityId={identityId}
							/>
						)}
					</IotConsumer>
				)}
			</IdentityIdConsumer>
		)}
	</CredentialsConsumer>
)
