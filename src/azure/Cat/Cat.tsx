import * as signalR from '@microsoft/signalr'
import * as merge from 'deepmerge'
import { Either, isLeft, isRight, left } from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'
import { isSome, none } from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import React, { useEffect, useState } from 'react'
import { Alert, Card, CardBody, CardHeader } from 'reactstrap'
import { DeviceTwin } from '../../@types/azure-device'
import { NCellMeasReport } from '../../@types/device-state'
import { CatCard } from '../../Cat/CatCard'
import { LoadedCat } from '../../Cat/CatLoader'
import {
	CatPersonalization,
	MobileOnlyCatHeader,
} from '../../Cat/CatPersonality'
import { DeleteCat } from '../../Cat/DeleteCat'
import { Collapsable } from '../../Collapsable/Collapsable'
import { ConnectionInformation } from '../../ConnectionInformation/ConnectionInformation'
import { DeviceInfo } from '../../DeviceInformation/DeviceInformation'
import { NeighborCellMeasurementsReport } from '../../DeviceInformation/NeighborCellMeasurementsReport'
import { emojify } from '../../Emojify/Emojify'
import { DisplayError } from '../../Error/Error'
import { ErrorInfo } from '../../Error/ErrorInfo'
import { HistoricalButtonPresses } from '../../HistoricalButtonPresses/HistoricalButtonPresses'
import { HistoricalDataChart } from '../../HistoricalData/HistoricalDataChart'
import { Loading } from '../../Loading/Loading'
import { HistoricalDataMap } from '../../Map/HistoricalDataMap'
import { CatMapContainer, CellLocation, Location } from '../../Map/Map'
import { ReportedTime } from '../../ReportedTime/ReportedTime'
import { Settings } from '../../Settings/Settings'
import { Toggle } from '../../Toggle/Toggle'
import { ApiClient, Device } from '../api'
import { FOTA } from '../FOTA/FOTA'
import { Jobs } from '../FOTA/FOTAJob'
import { HistoricalDataLoader } from '../HistoricalData/HistoricalDataLoader'
import { connect } from '../signalr'
import { SignalRDisabledWarning } from '../SignalRDisabledWarning'
import {
	toReceivedProps,
	toReportedWithReceivedAt,
} from '../toReportedWithReceivedAt'

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
	const [ncellMeasReport, setNcellMeasReport] = useState<NCellMeasReport>()
	const [neighboringCellGeoLocation, setNeighboringCellGeoLocation] =
		useState<CellLocation>()

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
				c.on(
					`deviceMessage:${cat.id}`,
					({ deviceId, message, propertiesArray }) => {
						if (propertiesArray.ncellmeas !== undefined && !isCancelled) {
							console.log(
								'[Ncellmeas]',
								`device ${deviceId} published a new report`,
								message,
							)
							setNcellMeasReport(undefined)
						}
					},
				)
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

	// Fetch neighboring cell location
	useEffect(() => {
		let isMounted = true
		if (ncellMeasReport !== undefined) return
		apiClient
			.getNcellmeas(cat.id)
			.then((res) => {
				if (isRight(res) && isSome(res.right) && isMounted) {
					setNcellMeasReport(res.right.value)
					console.log('[NcellMeas]', res.right.value.reportId)
				}
			})
			.catch(console.error.bind('[NcellMeas]'))
		return () => {
			isMounted = false
		}
	}, [apiClient, cat, ncellMeasReport])

	useEffect(() => {
		let isMounted = true
		if (ncellMeasReport === undefined) return
		apiClient
			.geolocateNcellMeasReportFromNrfCloud(ncellMeasReport.reportId)
			.then((res) => {
				if (isRight(res) && isMounted)
					setNeighboringCellGeoLocation({
						ts: ncellMeasReport.reportedAt,
						position: res.right,
					})
			})
			.catch(console.error.bind('[NcellMeas]'))
		return () => {
			isMounted = false
		}
	}, [ncellMeasReport, apiClient])

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
	if (reportedWithTime.gnss?.v?.value?.lat !== undefined) {
		deviceLocation = {
			ts: new Date(reportedWithTime.gnss?.ts?.value ?? Date.now()),
			position: {
				lat: reportedWithTime.gnss.v?.value.lat,
				lng: reportedWithTime.gnss.v?.value.lng,
				accuracy: reportedWithTime.gnss?.v?.value.acc,
				heading: reportedWithTime.gnss?.v?.value.hdg,
			},
		}
	}

	// Calculate the interval in which the device is expected to publish data
	const expectedSendIntervalInSeconds =
		(reportedWithTime.cfg?.act?.value ?? true // default device mode is active
			? reportedWithTime.cfg?.actwt?.value ?? 120 // default active wait time is 120 seconds
			: reportedWithTime.cfg?.mvt?.value ?? 3600) + // default movement timeout is 3600
		(reportedWithTime.cfg?.gnsst?.value ?? 60) + // default GNSS timeout is 60 seconds
		60 // add 1 minute for sending and processing

	return (
		<CatCard>
			{realtimeUpdatesDisabled && <SignalRDisabledWarning />}
			<CatMapContainer>
				<HistoricalDataMap
					deviceLocation={deviceLocation}
					cellLocation={cellLocation}
					neighboringCellGeoLocation={neighboringCellGeoLocation}
					cat={cat}
					fetchHistory={async (numEntries) =>
						apiClient
							.queryHistoricalDeviceData(
								`SELECT c.deviceUpdate.properties.reported.gnss.v AS v, c.deviceUpdate.properties.reported.gnss.ts AS ts FROM c WHERE c.deviceUpdate.properties.reported.gnss.v != null AND c.deviceId = "${cat.id}" ORDER BY c.timestamp DESC OFFSET 0 LIMIT ${numEntries}`,
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
										position: { lat, lng, speed, heading, altitude, accuracy },
										ts: new Date(ts),
									}),
								)
								return location.map((location) => ({ location }))
							})
					}
				/>
			</CatMapContainer>
			<CardHeader>
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
						<ConnectionInformation
							mccmnc={reportedWithTime.roam.v.value.mccmnc}
							rsrp={reportedWithTime.roam.v.value.rsrp}
							receivedAt={reportedWithTime.roam.v.receivedAt}
							reportedAt={new Date(reportedWithTime.roam.ts.value)}
							networkMode={reportedWithTime.dev.v.value.nw}
							iccid={reportedWithTime.dev.v.value.iccid}
							dataStaleAfterSeconds={expectedSendIntervalInSeconds}
						/>
					</Toggle>
				)}
				{reportedWithTime.gnss?.v && (
					<Toggle>
						<div className={'info'}>
							{reportedWithTime.gnss?.v?.value.spd &&
								emojify(
									` 🏃${Math.round(reportedWithTime.gnss?.v?.value.spd)}m/s`,
								)}
							{reportedWithTime.gnss?.v?.value.alt &&
								emojify(
									`✈️ ${Math.round(reportedWithTime.gnss?.v?.value.alt)}m`,
								)}
							<ReportedTime
								receivedAt={reportedWithTime.gnss?.v.receivedAt}
								reportedAt={
									new Date(reportedWithTime.gnss?.ts?.value ?? Date.now())
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
						key={JSON.stringify(cat.state.desired?.cfg ?? {})}
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
								appV={cat.state.reported.firmware?.currentFwVersion}
								dataStaleAfterSeconds={expectedSendIntervalInSeconds}
							/>
						</Collapsable>
					</>
				)}
				<hr />
				<Collapsable
					id={'cat:ncell'}
					title={<h3>{emojify('🗧 Neighboring cells')}</h3>}
				>
					<NeighborCellMeasurementsReport
						key={cat.version}
						getNeighboringCellMeasurementReport={async () => {
							const r = await apiClient.getNcellmeas(cat.id)
							if (isLeft(r)) {
								console.error(r.left)
								return none
							}
							return r.right
						}}
					/>
				</Collapsable>
				{cat.state.reported.firmware && (
					<>
						<hr />
						<Collapsable
							id={'cat:fota'}
							title={<h3>{emojify('🌩️ Device Firmware Upgrade (FOTA)')}</h3>}
						>
							<FOTA
								key={`${cat.version}`}
								fw={cat.state.reported.firmware}
								onCreateUpgradeJob={({ file, version }) => {
									onReportedFOTAJobProgressCreate({ file, version })
								}}
							/>
							<Jobs jobs={fotaJobs} />
						</Collapsable>
					</>
				)}
				<hr />
				<Collapsable id={'cat:roam'} title={<h3>{emojify('📶 RSRP')}</h3>}>
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
							value: v,
							date: new Date(ts),
						})}
					>
						{({ data }) => (
							<HistoricalDataChart
								data={data}
								type={'line'}
								min={-140}
								max={-40}
							/>
						)}
					</HistoricalDataLoader>
				</Collapsable>
				<hr />
				<Collapsable id={'cat:bat'} title={<h3>{emojify('🔋 Battery')}</h3>}>
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
				</Collapsable>
				<hr />
				<Collapsable
					id={'cat:environment'}
					title={<h3>{emojify('🌡️ Temperature')}</h3>}
				>
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
				</Collapsable>
				<hr />
				<Collapsable id={'cat:button'} title={<h3>{emojify('🚨 Button')}</h3>}>
					<HistoricalDataLoader
						apiClient={apiClient}
						QueryString={`SELECT c.deviceUpdate.btn.v AS v, c.deviceUpdate.btn.ts AS ts FROM c WHERE c.deviceId = "${cat.id}" AND  c.deviceUpdate.btn.v != null ORDER BY c.timestamp DESC OFFSET 0 LIMIT 10`}
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
						{({ data }) => <HistoricalButtonPresses data={data} />}
					</HistoricalDataLoader>
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
