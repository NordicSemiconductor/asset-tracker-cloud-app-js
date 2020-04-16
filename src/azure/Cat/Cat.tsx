import React, { useState, useEffect } from 'react'
import { ApiClient, Device } from '../api'
import { CatCard } from '../../Cat/CatCard'
import { CatHeader, CatPersonalization } from '../../Cat/CatPersonality'
import { CardHeader, CardBody, Alert, Card } from 'reactstrap'
import { emojify } from '../../Emojify/Emojify'
import { Collapsable } from '../../Collapsable/Collapsable'
import { DeleteCat } from '../../Cat/DeleteCat'
import { DisplayError } from '../../Error/Error'
import { ErrorInfo } from '../../Error/ErrorInfo'
import { isLeft, isRight } from 'fp-ts/lib/Either'
import { Loading } from '../../Loading/Loading'
import { LoadedCat } from '../../Cat/CatLoader'
import { Settings, ReportedConfigState } from '../../Settings/Settings'
import { DeviceTwinState } from '../../@types/azure-device'
import * as signalR from '@microsoft/signalr'

const isNameValid = (name: string) => /^.{1,255}$/i.test(name)

const toReportedConfig = ({
	cfg,
	$metadata,
}: DeviceTwinState): Partial<ReportedConfigState> => {
	let c = {} as Partial<ReportedConfigState>
	Object.keys(cfg).forEach((k) => {
		c = {
			...c,
			[k as keyof ReportedConfigState]: {
				value: cfg?.[k as keyof ReportedConfigState],
				receivedAt: new Date(
					$metadata?.cfg?.[k as keyof ReportedConfigState].$lastUpdated,
				),
			},
		}
	})
	return c
}

export const Cat = ({
	apiClient,
	cat,
	update,
}: {
	apiClient: ApiClient
	cat: Device & LoadedCat
	update: (cat: Device & LoadedCat) => void
}) => {
	const [deleted, setDeleted] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<ErrorInfo>()

	// Listen for state changes
	useEffect(() => {
		let isCancelled = false
		let connection: signalR.HubConnection
		apiClient
			.getSignalRConnectionInfo()
			.then((maybeConnectionInfo) => {
				if (!isCancelled && isRight(maybeConnectionInfo)) {
					connection = new signalR.HubConnectionBuilder()
						.withUrl(maybeConnectionInfo.right.url, {
							accessTokenFactory: () => maybeConnectionInfo.right.accessToken,
						})
						.build()

					connection.on(`deviceUpdate:${cat.id}`, (data) => {
						if (!isCancelled)
							update({
								...cat,
								state: {
									...cat.state,
									...data.update,
								},
							})
					})
					connection.start().catch((error) => {
						console.error('[SignalR]', error)
					})
				}
			})
			.catch(setError)
		return () => {
			isCancelled = true
			connection?.stop().catch(console.error)
		}
	}, [cat, apiClient, update])

	if (deleting) {
		return (
			<Card>
				<CardBody>
					<Loading text={`Deleting ${cat.id}...`} />
				</CardBody>
			</Card>
		)
	}

	if (deleted) {
		return (
			<Alert color={'success'}>
				The cat <code>{cat.id}</code> has been deleted.
			</Alert>
		)
	}

	if (error) return <DisplayError error={error} />

	const onAvatarChange = (avatar: Blob) => {
		// Display image directly
		const reader = new FileReader()
		reader.onload = (e: any) => {
			update({
				...cat,
				avatar: e.target.result,
			})
		}
		reader.readAsDataURL(avatar)

		apiClient
			.storeImage(avatar)
			.then((maybeUrl) => {
				if (isLeft(maybeUrl)) {
					setError(maybeUrl.left)
				} else {
					apiClient
						.setDeviceAvatar(cat.id, maybeUrl.right.url)
						.then((res) => {
							if (isLeft(res)) {
								setError(res.left)
							}
						})
						.catch(setError)
				}
			})
			.catch(setError)
	}
	const onNameChange = (name: string) => {
		update({
			...cat,
			name,
		})
		apiClient
			.setDeviceName(cat.id, name)
			.then((res) => {
				if (isLeft(res)) {
					setError(res.left)
				}
			})
			.catch(setError)
	}

	return (
		<CatCard>
			{/* FIXME: Map goes here */}
			<CardHeader>
				<CatHeader
					{...{
						cat,
						isNameValid,
						onAvatarChange,
						onNameChange,
					}}
				></CatHeader>
			</CardHeader>
			<CardBody>
				<Collapsable
					id={'cat:personalization'}
					title={<h3>{emojify('⭐ Personalization')}</h3>}
				>
					<CatPersonalization
						{...{
							cat,
							isNameValid,
							onAvatarChange,
							onNameChange,
						}}
					/>
				</Collapsable>
				<hr />
				<Collapsable
					id={'cat:settings'}
					title={<h3>{emojify('⚙️ Settings')}</h3>}
				>
					<Settings
						reported={toReportedConfig(cat.state.reported)}
						desired={cat.state.desired?.cfg}
						onSave={(config) => {
							apiClient.setDeviceConfig(cat.id, config).catch((error) => {
								setError(error)
							})
						}}
					/>
				</Collapsable>
				<hr />
				<Collapsable
					id={'cat:dangerzone'}
					title={<h3>{emojify('☠️ Danger Zone')}</h3>}
				>
					<DeleteCat
						catId={cat.id}
						onDelete={() => {
							setDeleting(true)
							apiClient
								.deleteDevice(cat.id)
								.then((maybeSuccess) => {
									setDeleting(false)
									if (isLeft(maybeSuccess)) {
										setError(maybeSuccess.left)
									} else {
										setDeleted(maybeSuccess.right.success)
									}
								})
								.catch((error) => {
									setDeleting(false)
									setError(error)
								})
						}}
					/>
				</Collapsable>
			</CardBody>
		</CatCard>
	)
}
