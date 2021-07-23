import React, { useEffect, useState } from 'react'
import { ApiClient } from '../api'
import { isLeft } from 'fp-ts/lib/Either'
import { ErrorInfo } from '../../Error/ErrorInfo'
import { connect } from '../signalr'
import * as signalR from '@microsoft/signalr'
import { ButtonWarningProps } from '../../ButtonWarnings/ButtonWarnings'
import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'

type Cat = { id: string; name: string }
export const List = ({
	apiClient,
	showButtonWarning,
	snooze,
	setButtonPresses,
	renderLoading,
	renderError,
	render,
	renderSignalRDisabledWarning,
}: {
	apiClient: ApiClient
	renderLoading: () => JSX.Element
	renderSignalRDisabledWarning: () => JSX.Element
	renderError: (args: { error: Error | ErrorInfo }) => JSX.Element
	render: (args: { cats: Cat[] } & ButtonWarningProps) => JSX.Element
} & ButtonWarningProps) => {
	const [loading, setLoading] = useState(true)
	const [cats, setCats] = useState([] as { id: string; name: string }[])
	const [error, setError] = useState<ErrorInfo>()
	const [realtimeUpdatesDisabled, setRealtimeUpdatesDisabled] = useState(false)

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
							name: name ?? deviceId,
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
		void pipe(
			connect(apiClient),
			// eslint-disable-next-line
			TE.map((c) => {
				connection = c
				c.on(`deviceMessage:btn`, (data) => {
					// FIXME: Implement button state
					if (!isCancelled) {
						setButtonPresses((presses) => ({
							...presses,
							[data.deviceId]: new Date(data.message.btn.ts),
						}))
					}
				})
			}),
			TE.mapLeft((error) => {
				if (error.type === 'LimitExceededError') {
					setRealtimeUpdatesDisabled(true)
				}
				console.error(error)
			}),
		)()
		return () => {
			isCancelled = true
			connection?.stop().catch(console.error)
		}
	}, [apiClient, setButtonPresses])
	if (loading) return renderLoading()
	if (error) return renderError({ error })

	return (
		<>
			{realtimeUpdatesDisabled && renderSignalRDisabledWarning()}
			{render({ showButtonWarning, snooze, setButtonPresses, cats })}
		</>
	)
}
