import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { Loading } from '../../Loading/Loading'
import { DisplayError as ErrorComponent } from '../../Error/Error'
import { ApiClient } from '../api'
import { isLeft } from 'fp-ts/lib/Either'
import { ErrorInfo } from '../../Error/ErrorInfo'
import { connect } from '../signalr'
import * as signalR from '@microsoft/signalr'
import { DeviceDateMap } from '../../ButtonWarnings/ButtonWarnings'
import { CatList } from '../../CatList/CatList'

export const List = ({
	apiClient,
	showButtonWarning,
	snooze,
	setButtonPresses,
}: {
	apiClient: ApiClient
	showButtonWarning: (id: string) => Date | undefined
	snooze: (id: string) => void
	setButtonPresses: React.Dispatch<React.SetStateAction<DeviceDateMap>>
}) => {
	const [loading, setLoading] = useState(true)
	const [cats, setCats] = useState([] as { id: string; name: string }[])
	const [error, setError] = useState<ErrorInfo>()

	// Fetch cats
	useEffect(() => {
		let isCancelled = false
		apiClient
			.listDevices()
			.then((res) => {
				if (isCancelled) return
				setLoading(false)
				if (isLeft(res)) {
					setError(res.left)
				} else {
					setCats(
						res.right.map(({ deviceId, name }) => ({
							id: deviceId,
							name: name || deviceId,
						})),
					)
				}
			})
			.catch((err) => {
				console.error(err)
				if (isCancelled) return
				setLoading(false)
				setError(err)
			})
		return () => {
			isCancelled = true
		}
	}, [apiClient])

	// Listen for button presses
	useEffect(() => {
		let isCancelled = false
		let connection: signalR.HubConnection
		connect(apiClient)
			.then((c) => {
				connection = c
				c.on(`deviceMessage:btn`, (data) => {
					// FIXME: Implement button state
					console.log(data)
					if (!isCancelled) {
						setButtonPresses((presses) => ({
							...presses,
							[data.deviceId]: new Date(data.message.btn.ts),
						}))
					}
				})
			})
			.catch(setError)
		return () => {
			isCancelled = true
			connection?.stop().catch(console.error)
		}
	}, [apiClient, setButtonPresses])
	if (loading || error)
		return (
			<Card>
				<CardBody>
					{loading && <Loading text={'Herding cats...'} />}
					{error && <ErrorComponent error={error} />}
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
