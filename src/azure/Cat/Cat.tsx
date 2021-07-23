import React, { useState, useEffect } from 'react'
import { ApiClient, Device } from '../api'
import {
	MobileOnlyCatHeader,
	CatPersonalization,
} from '../../Cat/CatPersonality'
import { emojify } from '../../Emojify/Emojify'
import { ErrorInfo } from '../../Error/ErrorInfo'
import { Either, isLeft, isRight, left } from 'fp-ts/lib/Either'
import { LoadedCat } from '../../Cat/CatLoader'
import { Settings } from '../../Settings/Settings'
import * as signalR from '@microsoft/signalr'
import { connect } from '../signalr'
import * as merge from 'deepmerge'
import { DeviceTwin } from '../../@types/azure-device'
import { CatMapContainer, Location, CellLocation } from '../../Map/Map'
import { Toggle } from '../../Toggle/Toggle'
import { ReportedTime } from '../../ReportedTime/ReportedTime'
import {
	toReportedWithReceivedAt,
	toReceivedProps,
} from '../toReportedWithReceivedAt'
import { DeviceInfo } from '../../DeviceInformation/DeviceInformation'
import { FOTA } from '../FOTA/FOTA'
import { Jobs } from '../FOTA/FOTAJob'
import { HistoricalDataLoader } from '../HistoricalData/HistoricalDataLoader'
import { HistoricalDataChart } from '../../HistoricalData/HistoricalDataChart'
import { HistoricalDataMap } from '../../Map/HistoricalDataMap'
import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { dbmToRSRP } from '@nordicsemiconductor/rsrp-bar'

const isNameValid = (name: string) => /^.{1,255}$/i.test(name)

export const Cat = ({
	apiClient,
	cat,
	update,
	renderConnectionInformation,
	renderHistoricalButtonPresses,
	renderError,
	renderOnDeleting,
	renderOnDeleted,
	render,
	renderSignalRDisabledWarning,
	renderCollapsable,
	renderDivider,
	renderDelete,
}: {
	apiClient: ApiClient
	cat: Device & LoadedCat
	update: (cat: Device & LoadedCat) => void
	renderConnectionInformation: (args: {
		networkMode?: string
		iccid?: string
		rsrp: number
		mccmnc: number
		receivedAt: Date
		reportedAt: Date
		dataStaleAfterSeconds: number
	}) => JSX.Element
	renderHistoricalButtonPresses: (args: {
		presses: { button: number; date: Date }[]
	}) => JSX.Element
	renderError: (args: { error: Error | ErrorInfo }) => JSX.Element
	renderOnDeleting: () => JSX.Element
	renderOnDeleted: () => JSX.Element
	render: (args: {
		header: JSX.Element
		body: JSX.Element
		map?: JSX.Element
	}) => JSX.Element
	renderSignalRDisabledWarning: () => JSX.Element
	renderCollapsable: (args: {
		title: string
		id: string
		children: JSX.Element | JSX.Element[]
	}) => JSX.Element
	renderDivider: () => JSX.Element
	renderDelete: (args: {
		catId: string
		onDelete: () => unknown
	}) => JSX.Element
}) => {
	const reportedWithTime = toReportedWithReceivedAt(cat.state.reported)
	const fotaJob =
		cat.state.desired.firmware &&
		cat.state.desired.$metadata.firmware &&
		toReceivedProps(
			cat.state.desired.firmware,
			cat.state.desired.$metadata.firmware,
		)

	const fotaJobs = fotaJob
		? [{ job: fotaJob, status: reportedWithTime.firmware }]
		: []

	const [deleted, setDeleted] = useState(false)
	const [realtimeUpdatesDisabled, setRealtimeUpdatesDisabled] = useState(false)
	const [deleting, setDeleting] = useState(false)
	const [error, setError] = useState<ErrorInfo>()
	const [cellLocation, setCellLocation] = useState<CellLocation>()

	// Listen for state changes
	useEffect(() => {
		let isCancelled = false
		let connection: signalR.HubConnection

		void pipe(
			connect(apiClient),
			// eslint-disable-next-line
			TE.map((c) => {
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
	}, [cat, apiClient, update])

	// Fetch cell geolocation
	const roamingInfo = cat.state.reported.roam
	const devInfo = cat.state.reported.dev
	useEffect(() => {
		if (roamingInfo === undefined) return
		let removed = false

		const locatCell = async (cell: {
			cell: number
			area: number
			mccmnc: number
			nw: 'ltem' | 'nbiot'
		}): Promise<
			Either<ErrorInfo, { lat: number; lng: number; accuracy: number }>
		> => {
			const cellFromDevices = await apiClient.geolocateCell(cell)
			if (isRight(cellFromDevices)) return cellFromDevices
			const cellFromUnwiredLabs = await apiClient.geolocateCellFromUnwiredLabs(
				cell,
			)
			if (isRight(cellFromUnwiredLabs)) return cellFromUnwiredLabs
			return left({
				type: 'Not found',
				message: `Could not resolve cell`,
				detail: cell,
			})
		}

		void locatCell({
			...roamingInfo.v,
			nw: devInfo?.v.nw.includes('NB-IoT') ? 'nbiot' : 'ltem',
		})
			.then((res) => {
				if (isRight(res) && !removed) {
					console.debug('[Cell Geolocation]', res.right)
					setCellLocation({ position: res.right, ts: new Date() })
				}
			})
			.catch(setError)
		return () => {
			removed = true
		}
	}, [roamingInfo, devInfo, apiClient])

	if (deleting) {
		return renderOnDeleting()
	}

	if (deleted) {
		return renderOnDeleted()
	}

	if (error) return renderError({ error })

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

	const onReportedFOTAJobProgressCreate = ({
		file,
		version,
	}: {
		file: File
		version: string
	}) => {
		apiClient
			.storeDeviceUpgrade(file)
			.then((maybeStoredUpgrade) => {
				if (isLeft(maybeStoredUpgrade)) {
					setError(maybeStoredUpgrade.left)
				} else {
					apiClient
						.setPendingDeviceUpgrade({
							id: cat.id,
							url: maybeStoredUpgrade.right.url,
							version,
						})
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

	let deviceLocation: Location | undefined = undefined
	if (reportedWithTime.gps?.v?.value?.lat !== undefined) {
		deviceLocation = {
			ts: new Date(reportedWithTime.gps?.ts?.value ?? Date.now()),
			position: {
				lat: reportedWithTime.gps.v?.value.lat,
				lng: reportedWithTime.gps.v?.value.lng,
				accuracy: reportedWithTime.gps?.v?.value.acc,
				heading: reportedWithTime.gps?.v?.value.hdg,
			},
		}
	}

	// Calculate the interval in which the device is expected to publish data
	const expectedSendIntervalInSeconds =
		(reportedWithTime.cfg?.act?.value ?? true // default device mode is active
			? reportedWithTime.cfg?.actwt?.value ?? 120 // default active wait time is 120 seconds
			: reportedWithTime.cfg?.mvt?.value ?? 3600) + // default movement timeout is 3600
		(reportedWithTime.cfg?.gpst?.value ?? 60) + // default GPS timeout is 60 seconds
		60 // add 1 minute for sending and processing

	return render({
		map: (
			<>
				{realtimeUpdatesDisabled && renderSignalRDisabledWarning()}
				<CatMapContainer>
					<HistoricalDataMap
						deviceLocation={deviceLocation}
						cellLocation={cellLocation}
						cat={cat}
						fetchHistory={async (numEntries) =>
							apiClient
								.queryHistoricalDeviceData(
									`SELECT c.deviceUpdate.properties.reported.gps.v AS v, c.deviceUpdate.properties.reported.gps.ts AS ts FROM c WHERE c.deviceUpdate.properties.reported.gps.v != null AND c.deviceId = "${cat.id}" ORDER BY c.timestamp DESC OFFSET 0 LIMIT ${numEntries}`,
								)
								.then((res) => {
									if (isLeft(res)) return []
									const location = (
										res.right.result as {
											v: {
												lat: number
												lng: number
												hdg: number
												spd: number
												alt: number
												acc: number
											}
											ts: string
										}[]
									).map(
										({
											v: {
												lat,
												lng,
												spd: speed,
												hdg: heading,
												alt: altitude,
												acc: accuracy,
											},
											ts,
										}) => ({
											position: {
												lat,
												lng,
												speed,
												heading,
												altitude,
												accuracy,
											},
											ts: new Date(ts),
										}),
									)
									return location.map((location) => ({ location }))
								})
						}
					/>
				</CatMapContainer>
			</>
		),
		header: (
			<>
				<MobileOnlyCatHeader
					{...{
						cat,
						isNameValid,
						onAvatarChange,
						onNameChange,
					}}
				></MobileOnlyCatHeader>
				{reportedWithTime.roam?.v && reportedWithTime.dev?.v && (
					<Toggle>
						{renderConnectionInformation({
							mccmnc: reportedWithTime.roam.v.value.mccmnc,
							rsrp: reportedWithTime.roam.v.value.rsrp,
							receivedAt: reportedWithTime.roam.v.receivedAt,
							reportedAt: new Date(reportedWithTime.roam.ts.value),
							networkMode: reportedWithTime.dev.v.value.nw,
							iccid: reportedWithTime.dev.v.value.iccid,
							dataStaleAfterSeconds: expectedSendIntervalInSeconds,
						})}
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
									new Date(reportedWithTime.gps?.ts?.value ?? Date.now())
								}
								staleAfterSeconds={expectedSendIntervalInSeconds}
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
								staleAfterSeconds={expectedSendIntervalInSeconds}
							/>
						</div>
					</Toggle>
				)}
				{reportedWithTime?.env && (
					<Toggle>
						<div className={'info'}>
							{emojify(`🌡️ ${reportedWithTime.env.v.value.temp}°C`)}
							{emojify(`💦 ${Math.round(reportedWithTime.env.v.value.hum)}%`)}
							<ReportedTime
								receivedAt={reportedWithTime.env.v.receivedAt}
								reportedAt={new Date(reportedWithTime.env.ts.value)}
								staleAfterSeconds={expectedSendIntervalInSeconds}
							/>
						</div>
					</Toggle>
				)}
			</>
		),
		body: (
			<>
				{renderCollapsable({
					id: 'cat:personalization',
					title: '⭐ Personalization',
					children: (
						<CatPersonalization
							{...{
								cat,
								isNameValid,
								onAvatarChange,
								onNameChange,
							}}
						/>
					),
				})}
				{renderDivider()}
				{renderCollapsable({
					id: 'cat:settings',
					title: '⚙️ Settings',
					children: (
						<Settings
							reported={reportedWithTime.cfg}
							desired={cat.state.desired?.cfg}
							key={JSON.stringify(cat.state.desired?.cfg ?? {})}
							onSave={(config) => {
								apiClient.setDeviceConfig(cat.id, config).catch((error) => {
									setError(error)
								})
							}}
						/>
					),
				})}
				{reportedWithTime?.dev && reportedWithTime?.roam && (
					<>
						{renderDivider()}
						{renderCollapsable({
							id: 'cat:information',
							title: 'ℹ️ Device Information',
							children: (
								<DeviceInfo
									key={`${cat.version}`}
									device={reportedWithTime.dev}
									roaming={reportedWithTime.roam}
									appV={cat.state.reported.firmware?.currentFwVersion}
									dataStaleAfterSeconds={expectedSendIntervalInSeconds}
								/>
							),
						})}
					</>
				)}
				{cat.state.reported.firmware && (
					<>
						{renderDivider()}
						{renderCollapsable({
							id: 'cat:fota',
							title: '🌩️ Device Firmware Upgrade (FOTA)',
							children: (
								<>
									<FOTA
										key={`${cat.version}`}
										fw={cat.state.reported.firmware}
										onCreateUpgradeJob={({ file, version }) => {
											onReportedFOTAJobProgressCreate({ file, version })
										}}
										renderError={renderError}
									/>
									<Jobs jobs={fotaJobs} />
								</>
							),
						})}
					</>
				)}
				{renderDivider()}
				{renderCollapsable({
					id: 'cat:roam',
					title: '📶 RSRP',
					children: (
						<HistoricalDataLoader
							apiClient={apiClient}
							QueryString={`SELECT c.deviceUpdate.properties.reported.roam.v.rsrp AS v, c.deviceUpdate.properties.reported.roam.ts AS ts FROM c WHERE c.deviceId = "${cat.id}" AND c.deviceUpdate.properties.reported.roam != null ORDER BY c.timestamp DESC OFFSET 0 LIMIT 100`}
							formatFields={({
								v,
								ts,
							}: {
								v: number
								ts: string
							}): { value: number; date: Date } => ({
								value: -dbmToRSRP(-v),
								date: new Date(ts),
							})}
						>
							{({ data }) => (
								<HistoricalDataChart data={data} type={'line'} max={-70} />
							)}
						</HistoricalDataLoader>
					),
				})}
				{renderDivider()}
				{renderCollapsable({
					id: 'cat:bat',
					title: '🔋 Battery',
					children: (
						<HistoricalDataLoader
							apiClient={apiClient}
							QueryString={`SELECT c.deviceUpdate.properties.reported.bat.v AS v, c.deviceUpdate.properties.reported.bat.ts AS ts FROM c WHERE c.deviceId = "${cat.id}" AND c.deviceUpdate.properties.reported.bat != null ORDER BY c.timestamp DESC OFFSET 0 LIMIT 100`}
							formatFields={({
								v,
								ts,
							}: {
								v: number
								ts: string
							}): { value: number; date: Date } => ({
								value: v,
								date: new Date(ts),
							})}
						>
							{({ data }) => <HistoricalDataChart data={data} type={'line'} />}
						</HistoricalDataLoader>
					),
				})}
				{renderDivider()}
				{renderCollapsable({
					id: 'cat:environment',
					title: '🌡️ Temperature',
					children: (
						<HistoricalDataLoader
							apiClient={apiClient}
							QueryString={`SELECT c.deviceUpdate.properties.reported.env.v.temp AS v, c.deviceUpdate.properties.reported.env.ts AS ts FROM c WHERE c.deviceId = "${cat.id}" AND c.deviceUpdate.properties.reported.env.v.temp != null ORDER BY c.timestamp DESC OFFSET 0 LIMIT 100`}
							formatFields={({
								v,
								ts,
							}: {
								v: number
								ts: string
							}): { value: number; date: Date } => ({
								value: v,
								date: new Date(ts),
							})}
						>
							{({ data }) => <HistoricalDataChart data={data} type={'line'} />}
						</HistoricalDataLoader>
					),
				})}
				{renderDivider()}
				{renderCollapsable({
					id: 'cat:button',
					title: '🚨 Button',
					children: (
						<HistoricalDataLoader
							apiClient={apiClient}
							QueryString={`SELECT c.deviceUpdate.btn.v AS button, c.deviceUpdate.btn.ts AS ts FROM c WHERE c.deviceId = "${cat.id}" AND  c.deviceUpdate.btn.v != null ORDER BY c.timestamp DESC OFFSET 0 LIMIT 10`}
							formatFields={({
								button,
								ts,
							}: {
								button: number
								ts: string
							}): { button: number; date: Date } => ({
								button: button,
								date: new Date(ts),
							})}
						>
							{({ data }) => renderHistoricalButtonPresses({ presses: data })}
						</HistoricalDataLoader>
					),
				})}
				{renderDivider()}
				{renderCollapsable({
					id: 'cat:dangerzone',
					title: '☠️ Danger Zone',
					children: renderDelete({
						catId: cat.id,
						onDelete: () => {
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
						},
					}),
				})}
			</>
		),
	})
}
