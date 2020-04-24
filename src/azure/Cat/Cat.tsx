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
import { isLeft } from 'fp-ts/lib/Either'
import { Loading } from '../../Loading/Loading'
import { LoadedCat } from '../../Cat/CatLoader'
import { Settings } from '../../Settings/Settings'
import * as signalR from '@microsoft/signalr'
import { connect } from '../signalr'
import * as merge from 'deepmerge'
import { DeviceTwin } from '../../@types/azure-device'
import { Map, CatMapContainer, Location, CellLocation } from '../../Map/Map'
import { Toggle } from '../../Toggle/Toggle'
import { ReportedTime } from '../../ReportedTime/ReportedTime'
import { toReportedWithReceivedAt } from '../toReportedWithReceivedAt'
import { ConnectionInformation } from '../../ConnectionInformation/ConnectionInformation'
import { DeviceInfo } from '../../DeviceInformation/DeviceInformation'

const isNameValid = (name: string) => /^.{1,255}$/i.test(name)

export const Cat = ({
	apiClient,
	cat,
	update,
}: {
	apiClient: ApiClient
	cat: Device & LoadedCat
	update: (cat: Device & LoadedCat) => void
}) => {
	const reportedWithTime = toReportedWithReceivedAt(cat.state.reported)

	const [deleted, setDeleted] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<ErrorInfo>()

	// Listen for state changes
	useEffect(() => {
		let isCancelled = false
		let connection: signalR.HubConnection
		connect(apiClient)
			.then((c) => {
				connection = c
				c.on(`deviceState:${cat.id}`, (data) => {
					if (!isCancelled) {
						console.log('state', data.state)
						update({
							...cat,
							state: merge.all<DeviceTwin>([cat.state, data.state]),
						})
					}
				})
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

	let deviceLocation: Location | undefined = undefined
	if (reportedWithTime.gps?.v?.value?.lat) {
		deviceLocation = {
			ts: new Date(reportedWithTime.gps?.ts?.value || Date.now()),
			position: {
				lat: reportedWithTime.gps.v?.value.lat,
				lng: reportedWithTime.gps.v?.value.lng,
			},
		}
	}

	// FIXME: Implement cell geolocation
	const cellLocation: CellLocation | undefined = undefined

	return (
		<CatCard>
			<CatMapContainer>
				<Map
					deviceLocation={deviceLocation}
					cellLocation={cellLocation}
					accuracy={reportedWithTime.gps?.v?.value.acc}
					heading={reportedWithTime.gps?.v?.value.hdg}
					label={cat.id}
				/>
			</CatMapContainer>
			<CardHeader>
				<CatHeader
					{...{
						cat,
						isNameValid,
						onAvatarChange,
						onNameChange,
					}}
				></CatHeader>
				{reportedWithTime && (
					<>
						{reportedWithTime.roam?.v && reportedWithTime.dev?.v && (
							<Toggle>
								<ConnectionInformation
									mccmnc={reportedWithTime.roam.v.value.mccmnc}
									rsrp={reportedWithTime.roam.v.value.rsrp}
									receivedAt={reportedWithTime.roam.v.receivedAt}
									reportedAt={new Date(reportedWithTime.roam.ts.value)}
									networkOperator={reportedWithTime.dev.v.value.nw}
								/>
							</Toggle>
						)}
						{reportedWithTime.gps?.v && (
							<Toggle>
								<div className={'info'}>
									{reportedWithTime.gps?.v?.value.spd &&
										emojify(
											` 🏃${Math.round(reportedWithTime.gps?.v?.value.spd)}m/s`,
										)}
									{reportedWithTime.gps?.v?.value.alt &&
										emojify(
											`✈️ ${Math.round(reportedWithTime.gps?.v?.value.alt)}m`,
										)}
									<ReportedTime
										receivedAt={reportedWithTime.gps?.v.receivedAt}
										reportedAt={
											new Date(reportedWithTime.gps?.ts?.value || Date.now())
										}
									/>
								</div>
							</Toggle>
						)}
						{reportedWithTime.bat && (
							<Toggle>
								<div className={'info'}>
									{emojify(`🔋 ${reportedWithTime.bat.v.value / 1000}V`)}
									<span />
									<ReportedTime
										receivedAt={reportedWithTime.bat.v.receivedAt}
										reportedAt={new Date(reportedWithTime.bat.ts.value)}
									/>
								</div>
							</Toggle>
						)}
					</>
				)}
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
						reported={reportedWithTime.cfg}
						desired={cat.state.desired?.cfg}
						onSave={(config) => {
							apiClient.setDeviceConfig(cat.id, config).catch((error) => {
								setError(error)
							})
						}}
					/>
				</Collapsable>
				{reportedWithTime?.dev && reportedWithTime?.roam && (
					<>
						<hr />
						<Collapsable
							id={'cat:information'}
							title={<h3>{emojify('ℹ️ Device Information')}</h3>}
						>
							<DeviceInfo
								key={`${cat.version}`}
								device={reportedWithTime.dev}
								roaming={reportedWithTime.roam}
							/>
						</Collapsable>
					</>
				)}
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
