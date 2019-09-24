import React, { useContext, useEffect, useState } from 'react'
import { CredentialsConsumer, IdentityIdConsumer, IotConsumer } from '../App'
import { Card, CardBody, CardHeader, Alert } from 'reactstrap'
import { Iot, IotData, S3 } from 'aws-sdk'
import Athena from 'aws-sdk/clients/athena'
import { Loading } from '../Loading/Loading'
import { Error } from '../Error/Error'
import { device } from 'aws-iot-device-sdk'
import { Map } from '../Map/Map'
import { AvatarPicker } from '../Avatar/AvatarPicker'
import { uploadAvatar } from '../aws/uploadAvatar'
import { Editable } from '../Editable/Editable'
import { updateThingAttributes } from '../aws/updateThingAttributes'
import { AccelerometerDiagram } from '../AccelerometerDiagram/AccelerometerDiagram'
import { mergeReportedAndMetadata } from '../util/mergeReportedAndMetadata'
import * as introJs from 'intro.js'
import { HistoricalDataChart } from '../HistoricalData/HistoricalDataChart'
import { Collapsable } from '../Collapsable/Collapsable'
import { HistoricalDataLoader } from '../HistoricalData/HistoricalDataLoader'
import { ConnectionInformation } from './ConnectionInformation'
import { DeviceInfo } from './DeviceInformation'
import { Settings } from '../Settings/Settings'
import { DeviceShadow, Gps } from '../@types/DeviceShadow'
import { ReportedTime } from './ReportedTime'
import { NavbarBrandContext } from '../Navigation/NavbarBrand'
import { CatNavbar } from './CatNavbar'
import { Toggle } from '../Toggle/Toggle'
import { emojify } from '../Emojify/Emojify'
import { hideOnDesktop, mobileBreakpoint } from '../Styles'
import styled from 'styled-components'
import { NoMap } from './NoMap'
import { FOTA, OnCreateUpgradeJob } from './FOTA'
import { describeIotThing, ThingInfo } from '../aws/describeIotThing'
import { upgradeFirmware } from '../aws/upgradeFirmware'
import {
	DeviceUpgradeFirmwareJob,
	listUpgradeFirmwareJobs,
} from '../aws/listUpgradeFirmwareJobs'
import { cancelUpgradeFirmwareJob } from '../aws/cancelUpgradeFirmwareJob'
import { deleteUpgradeFirmwareJob } from '../aws/deleteUpgradeFirmwareJob'
import { DeleteCat } from './DeleteCat'
import { deleteIotThing } from '../aws/deleteIotThing'

const intro = introJs()

const MobileOnlyAvatarPicker = hideOnDesktop(AvatarPicker)
const MobileOnlyH2 = hideOnDesktop(styled.h2``)

const CatCard = styled(Card)`
	img.avatar {
		width: 75px;
		border-radius: 100%;
		border: 2px solid #000000b5;
		box-shadow: 0 2px 4px #00000057;
		background-color: #fff;
	}

	.card-header {
		position: relative;
		text-align: center;
		img.avatar {
			position: absolute;
			top: 0;
			left: 50%;
			margin-left: -38.5px;
			margin-top: -53.5px;
			z-index: 9000;
		}
		h2 {
			margin: 10px;
		}
		div.info {
			text-align: left;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			@media (min-width: ${mobileBreakpoint}) {
				display: grid;
				grid-template: auto / 1fr 1fr 2fr;
			}
			font-size: 85%;
			opacity: 0.75;
			span.reportedTime {
				font-size: 85%;
				opacity: 0.75;
				text-align: right;
				span.textWithIcon {
					width: auto;
					display: inline-block;
				}
			}
			padding-top: 0.5rem;
		}
		div.toggle + div.toggle {
			margin-top: 0.5rem;
			border-top: 1px solid #dcdcdc;
		}
		@media (max-width: ${mobileBreakpoint}) {
			div.info {
				.reportedTime {
					time {
						display: none;
					}
				}
			}
			.toggle.toggle-on {
				div.info {
					.reportedTime {
						time {
							display: inline;
						}
					}
				}
			}
		}
	}
	.card-body {
		h3 {
			font-size: 100%;
			@media (min-width: ${mobileBreakpoint}) {
				font-size: 115%;
			}
			margin: 0;
		}
		h4 {
			font-size: 105%;
		}
		.collapsable {
			&.personalization {
				.content {
					display: flex;
					justify-content: space-between;
				}
			}
		}
	}
`

const ShowCat = ({
	catId,
	iot,
	iotData,
	onCreateUpgradeJob,
	onAvatarChange,
	onNameChange,
	describeThing,
	listUpgradeJobs,
	cancelUpgradeJob,
	deleteUpgradeJob,
	identityId,
	credentials,
	children,
	map,
}: {
	iot: Iot
	iotData: IotData
	onAvatarChange: (args: { avatar: Blob }) => void
	onNameChange: (args: { name: string }) => void
	onCreateUpgradeJob: OnCreateUpgradeJob
	describeThing: (deviceId: string) => Promise<ThingInfo>
	listUpgradeJobs: (
		deviceId: string,
	) => () => Promise<DeviceUpgradeFirmwareJob[]>
	cancelUpgradeJob: (
		deviceId: string,
	) => (args: { jobId: string; force: boolean }) => Promise<void>
	deleteUpgradeJob: (
		deviceId: string,
	) => (args: { jobId: string; executionNumber: number }) => Promise<void>
	catId: string
	identityId: string
	credentials: {
		accessKeyId: string
		sessionToken: string
		secretAccessKey: string
	}
	map: (args: { gps: Gps }) => React.ReactElement<any>
	children: React.ReactElement<any> | React.ReactElement<any>[]
}) => {
	const [loading, setLoading] = useState(true)
	const [cat, setCat] = useState({
		name: catId,
		avatar: 'https://placekitten.com/75/75',
		version: 0,
	})
	const [state, setState] = useState({} as {
		desired?: any
		reported?: Partial<DeviceShadow>
	})
	const { reported, desired } = state
	const [error, setError] = useState()

	const navbarBrandState = useContext(NavbarBrandContext)
	const resetNavbar = navbarBrandState.reset
	const setNavbar = navbarBrandState.set

	useEffect(() => {
		let connection: device
		Promise.all([
			describeThing(catId),
			new Promise(resolve => {
				console.log('Connecting ...')
				connection = new device({
					clientId: `user-${identityId}`,
					region: process.env.REACT_APP_REGION,
					host: process.env.REACT_APP_MQTT_ENDPOINT,
					protocol: 'wss',
					accessKeyId: credentials.accessKeyId,
					sessionToken: credentials.sessionToken,
					secretKey: credentials.secretAccessKey,
				})
				connection.on('connect', async () => {
					console.log('connected')
					connection.subscribe(
						`$aws/things/${catId}/shadow/update/documents`,
						undefined,
						() => {
							resolve(connection)
						},
					)
				})
				connection.on('message', (topic, payload) => {
					const shadow = JSON.parse(payload.toString()).current
					const newState = {
						reported: mergeReportedAndMetadata({
							shadow,
						}),
						desired: shadow.state.desired,
					}
					setState(newState)
					console.log('Updated state', catId, newState)
				})
			}),
			iotData
				.getThingShadow({
					thingName: catId,
				})
				.promise()
				.then(async ({ payload }) =>
					payload ? JSON.parse(payload.toString()) : {},
				)
				.catch(err => {
					console.error(err)
					return {}
				}),
		])
			.then(([{ thingName, attributes, version }, _, shadow]) => {
				setLoading(false)
				if (shadow.state) {
					const reported = mergeReportedAndMetadata({ shadow })
					console.log('[reported]', reported)
					const desired = shadow.state.desired
					console.log('[desired]', desired)
					setState({
						reported,
						desired,
					})
				}
				if (thingName) {
					const name = (attributes && attributes.name) || thingName
					setCat({
						name,
						avatar:
							(attributes && attributes.avatar) ||
							'https://placekitten.com/75/75',
						version: version || 0,
					})
					setNavbar(
						<CatNavbar name={name} avatar={attributes && attributes.avatar} />,
					)
				}
			})
			.catch(err => {
				setError(err)
				setLoading(false)
			})

		return () => {
			connection && connection.end()
			resetNavbar()
		}
	}, [
		iot,
		iotData,
		catId,
		identityId,
		credentials,
		setNavbar,
		resetNavbar,
		describeThing,
	])

	useEffect(() => {
		if (!loading && !error) {
			setTimeout(() => {
				window.requestAnimationFrame(() => {
					if (!window.localStorage.getItem('bifravst:cat:intro')) {
						intro.start()
						intro.onexit(() => {
							window.localStorage.setItem('bifravst:cat:intro', 'done')
						})
						console.log('Starting Intro.js')
					}
				})
			}, 1000)
		}
	}, [loading, error])

	const hasMap =
		reported &&
		reported.gps &&
		reported.gps.v &&
		reported.gps.v.lat &&
		reported.gps.v.lng

	const [renderedMap, setMap] = useState()
	useEffect(() => {
		if (!reported || !reported.gps) {
			return
		}
		setMap(
			map({
				gps: reported.gps,
			}),
		)
	}, [reported, map])

	if (loading || error)
		return (
			<Card>
				<CardBody>
					{loading && <Loading text={`Opening can for ${catId}...`} />}
					{error && <Error error={error} />}
				</CardBody>
			</Card>
		)

	const onNameChanged = (v: string) => {
		onNameChange({ name: v })
		setNavbar(<CatNavbar name={v} avatar={cat.avatar} />)
	}

	const isCatNameValid = (name: string): boolean =>
		/^[0-9a-z_.,@/:#-]{1,800}$/i.test(name)

	const onAvatarUploaded = (blob: Blob) => {
		// Display image directly
		const reader = new FileReader()
		reader.onload = (e: any) => {
			setCat({
				...cat,
				avatar: e.target.result,
			})
			setNavbar(<CatNavbar name={cat.name} avatar={e.target.result} />)
		}
		reader.readAsDataURL(blob)
		onAvatarChange({ avatar: blob })
	}

	return (
		<>
			{hasMap && renderedMap}
			{!hasMap && <NoMap />}
			<CatCard>
				<CardHeader>
					<MobileOnlyAvatarPicker
						key={`${cat.version}`}
						onChange={onAvatarUploaded}
					>
						<img src={cat.avatar} alt={cat.name} className={'avatar'} />
					</MobileOnlyAvatarPicker>
					<MobileOnlyH2>
						<Editable
							key={`${cat.version}`}
							text={cat.name}
							onChange={onNameChanged}
							isValid={isCatNameValid}
						/>
					</MobileOnlyH2>
					{reported && (
						<>
							{reported.dev && reported.roam && (
								<Toggle>
									<ConnectionInformation
										device={reported.dev}
										roaming={reported.roam}
									/>
								</Toggle>
							)}
							{reported.gps && reported.gps.v && (
								<Toggle>
									<div className={'info'}>
										{reported.gps.v.spd &&
											emojify(` 🏃${Math.round(reported.gps.v.spd.value)}m/s`)}
										{reported.gps.v.alt &&
											emojify(`✈️ ${Math.round(reported.gps.v.alt.value)}m`)}
										<ReportedTime
											receivedAt={reported.gps.v.lat.receivedAt}
											reportedAt={new Date(reported.gps.ts.value)}
										/>
									</div>
								</Toggle>
							)}
							{reported.bat && reported.bat.v && (
								<Toggle>
									<div className={'info'}>
										{emojify(`🔋 ${reported.bat.v.value / 1000}V`)}
										<span />
										<ReportedTime
											receivedAt={reported.bat.v.receivedAt}
											reportedAt={new Date(reported.bat.ts.value)}
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
						<dl>
							<dt>Name</dt>
							<dd data-intro="Click here to edit the name of your cat.">
								<Editable
									key={`${cat.version}`}
									text={cat.name}
									onChange={onNameChanged}
									isValid={isCatNameValid}
								/>
							</dd>
						</dl>
						<AvatarPicker key={`${cat.version}`} onChange={onAvatarUploaded}>
							<img
								src={cat.avatar}
								alt={cat.name}
								className={'avatar'}
								data-intro="Click here to upload a new image for your cat."
							/>
						</AvatarPicker>
					</Collapsable>
					<hr />
					<Collapsable
						id={'cat:settings'}
						title={<h3>{emojify('⚙️ Settings')}</h3>}
					>
						<Settings
							key={`${cat.version}`}
							desired={desired && desired.cfg}
							reported={reported && reported.cfg}
							onSave={config => {
								iotData
									.updateThingShadow({
										thingName: catId,
										payload: JSON.stringify({
											state: {
												desired: {
													cfg: config,
												},
											},
										}),
									})
									.promise()
									.then(() => {
										setState({
											desired: {
												...desired,
												cfg: config,
											},
											reported,
										})
										setCat({
											...cat,
											version: ++cat.version,
										})
									})
									.catch(setError)
							}}
						/>
					</Collapsable>
					{reported && reported.dev && (
						<>
							<hr />
							<Collapsable
								id={'cat:information'}
								title={<h3>{emojify('ℹ️ Device Information')}</h3>}
							>
								<DeviceInfo
									key={`${cat.version}`}
									device={reported.dev}
									roaming={reported.roam}
								/>
							</Collapsable>
							<hr />
							<FOTA
								key={`${cat.version}`}
								device={reported.dev}
								onCreateUpgradeJob={onCreateUpgradeJob}
								listUpgradeJobs={listUpgradeJobs(catId)}
								cancelUpgradeJob={cancelUpgradeJob(catId)}
								deleteUpgradeJob={deleteUpgradeJob(catId)}
							/>
						</>
					)}
					{reported && reported.acc && reported.acc.v && (
						<>
							<hr />
							<Collapsable
								id={'cat:motion'}
								title={<h3>{emojify('🏃 Motion')}</h3>}
							>
								<AccelerometerDiagram
									values={reported.acc.v.map(
										({ value }: { value: number }) => value,
									)}
								/>
								<ReportedTime
									reportedAt={new Date(reported.acc.ts.value)}
									receivedAt={reported.acc.v[0].receivedAt}
								/>
							</Collapsable>
						</>
					)}
					<hr />
					{children}
				</CardBody>
			</CatCard>
		</>
	)
}

const athenaWorkGroup =
	process.env.REACT_APP_HISTORICALDATA_WORKGROUP_NAME || ''
const athenaDataBase = process.env.REACT_APP_HISTORICALDATA_DATABASE_NAME || ''
const athenaRawDataTable = process.env.REACT_APP_HISTORICALDATA_TABLE_NAME || ''

export const Cat = ({ catId }: { catId: string }) => {
	const [deleted, setDeleted] = useState(false)

	if (deleted) {
		return (
			<Card>
				<CardBody>
					<Alert color={'success'}>
						The cat <code>{catId}</code> has been deleted.
					</Alert>
				</CardBody>
			</Card>
		)
	}

	return (
		<CredentialsConsumer>
			{credentials => (
				<IdentityIdConsumer>
					{identityId => (
						<IotConsumer>
							{({ iot, iotData }) => {
								const s3 = new S3({
									credentials,
									region: process.env.REACT_APP_REGION,
								})
								const athena = new Athena({
									credentials,
									region: process.env.REACT_APP_REGION,
								})
								const avatarUploader = uploadAvatar({
									s3,
									bucketName: `${process.env.REACT_APP_AVATAR_BUCKET_NAME}`,
								})
								const attributeUpdater = updateThingAttributes({
									iot,
									thingName: catId,
								})

								const createUpgradeJob = upgradeFirmware({
									s3,
									bucketName: `${process.env.REACT_APP_FOTA_BUCKET_NAME}`,
									iot,
								})

								const listUpgradeJobs = listUpgradeFirmwareJobs({
									iot,
								})

								const cancelUpgradeJob = cancelUpgradeFirmwareJob({
									iot,
								})

								const deleteUpgradeJob = deleteUpgradeFirmwareJob({
									s3,
									bucketName: `${process.env.REACT_APP_FOTA_BUCKET_NAME}`,
									iot,
								})

								const describeCat = describeIotThing({ iot })

								const deleteCat = deleteIotThing({ iot })

								return (
									<ShowCat
										catId={catId}
										iot={iot}
										iotData={iotData}
										identityId={identityId}
										credentials={credentials}
										describeThing={describeCat}
										listUpgradeJobs={deviceId => async () =>
											listUpgradeJobs(deviceId)}
										cancelUpgradeJob={deviceId => async ({
											jobId,
											force,
										}: {
											jobId: string
											force: boolean
										}) => cancelUpgradeJob({ deviceId, jobId, force })}
										deleteUpgradeJob={deviceId => async ({
											jobId,
											executionNumber,
										}: {
											jobId: string
											executionNumber: number
										}) =>
											deleteUpgradeJob({ deviceId, jobId, executionNumber })}
										onCreateUpgradeJob={async args =>
											describeCat(catId).then(async ({ thingArn }) =>
												createUpgradeJob({
													...args,
													thingArn: thingArn,
												}),
											)
										}
										onAvatarChange={({ avatar }) => {
											avatarUploader({
												avatar,
											})
												.then(async ({ url }) =>
													attributeUpdater({ avatar: url }),
												)
												.catch(console.error)
										}}
										onNameChange={({ name }) => {
											attributeUpdater({ name }).catch(console.error)
										}}
										map={({ gps }: { gps: Gps }) => (
											<HistoricalDataLoader
												athena={athena}
												deviceId={catId}
												formatFields={{
													lat: parseFloat,
													lng: parseFloat,
													date: v => new Date(v),
												}}
												QueryString={`SELECT reported.gps.ts as date, reported.gps.v.lat as lat, reported.gps.v.lng as lng FROM ${athenaDataBase}.${athenaRawDataTable} WHERE deviceId='${catId}' AND reported.gps IS NOT NULL AND reported.gps.v.lat IS NOT NULL AND reported.gps.v.lng IS NOT NULL ORDER BY reported.gps.ts DESC LIMIT 10`}
												workGroup={athenaWorkGroup}
												loading={
													<Map
														position={{
															lat: gps.v.lat.value,
															lng: gps.v.lng.value,
														}}
														accuracy={gps.v.acc && gps.v.acc.value}
														heading={gps.v.hdg && gps.v.hdg.value}
														label={catId}
													/>
												}
											>
												{({ data }) => (
													<Map
														position={{
															lat: gps.v.lat.value,
															lng: gps.v.lng.value,
														}}
														accuracy={gps.v.acc && gps.v.acc.value}
														heading={gps.v.hdg && gps.v.hdg.value}
														label={catId}
														history={
															(data as unknown) as ({
																lat: number
																lng: number
															}[])
														}
													/>
												)}
											</HistoricalDataLoader>
										)}
									>
										<Collapsable
											id={'cat:bat'}
											title={<h3>{emojify('🔋 Battery')}</h3>}
										>
											<HistoricalDataLoader
												athena={athena}
												deviceId={catId}
												QueryString={`SELECT min(reported.bat.v) as value, CAST(date_format(timestamp, '%Y-%m-%d') AS DATE) AS date FROM 
${athenaDataBase}.${athenaRawDataTable} WHERE deviceId='${catId}' AND reported.bat IS NOT NULL GROUP BY CAST(date_format(timestamp, '%Y-%m-%d') AS DATE) ORDER BY date LIMIT 100`}
												formatFields={{
													value: v => parseInt(v, 10) / 1000,
													date: v => new Date(`${v}T00:00:00Z`),
												}}
												workGroup={athenaWorkGroup}
											>
												{({ data }) => (
													<HistoricalDataChart data={data} type={'line'} />
												)}
											</HistoricalDataLoader>
										</Collapsable>
										<hr />
										<Collapsable
											id={'cat:act'}
											title={<h3>{emojify('🏋️ Activity')}</h3>}
										>
											<HistoricalDataLoader
												athena={athena}
												deviceId={catId}
												formatFields={{
													value: (v: number[]) =>
														v.reduce((sum, v) => sum + Math.abs(v), 0),
													date: v => new Date(v),
												}}
												QueryString={`SELECT reported.acc.ts as date, reported.acc.v as value FROM ${athenaDataBase}.${athenaRawDataTable} WHERE deviceId='${catId}' AND reported.acc IS NOT NULL ORDER BY reported.acc.ts DESC LIMIT 100`}
												workGroup={athenaWorkGroup}
											>
												{({ data }) => (
													<HistoricalDataChart data={data} type={'column'} />
												)}
											</HistoricalDataLoader>
										</Collapsable>
										<hr />
										<Collapsable
											id={'cat:dangerzone'}
											title={<h3>{emojify('☠️ Danger Zone')}</h3>}
										>
											<DeleteCat
												catId={catId}
												onDelete={() => {
													deleteCat(catId)
														.then(() => {
															setDeleted(true)
														})
														.catch(console.error)
												}}
											/>
										</Collapsable>
									</ShowCat>
								)
							}}
						</IotConsumer>
					)}
				</IdentityIdConsumer>
			)}
		</CredentialsConsumer>
	)
}
