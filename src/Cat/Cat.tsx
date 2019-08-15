import React, { useEffect, useState } from 'react'
import { CredentialsConsumer, IdentityIdConsumer, IotConsumer } from '../App'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { Iot, IotData, S3 } from 'aws-sdk'
import Athena from 'aws-sdk/clients/athena'
import { Loading } from '../Loading/Loading'
import { Error } from '../Error/Error'
import { device } from 'aws-iot-device-sdk'
import { Map } from '../Map/Map'
import {
	BatteryStdRounded as BatteryIcon,
	DirectionsRun as SpeedIcon,
	FitnessCenter as ActivityIcon,
	Flight as AltitudeIcon,
	GpsOff as NoPositionIcon,
	Info as InfoIcon,
	Settings as SettingsIcon,
} from '@material-ui/icons'
import { AvatarPicker } from '../Avatar/AvatarPicker'
import { uploadAvatar } from './uploadAvatar'
import { Editable } from '../Editable/Editable'
import { updateThingAttributes } from './updateThingAttributes'
import { AccelerometerDiagram } from '../AccelerometerDiagram/AccelerometerDiagram'
import { mergeReportedAndMetadata } from '../mergeReportedAndMetadata'
import * as introJs from 'intro.js'
import { HistoricalDataChart } from '../HistoricalData/HistoricalDataChart'
import { Collapsable } from '../Collapsable/Collapsable'
import { HistoricalDataLoader } from '../HistoricalData/HistoricalDataLoader'
import { ConnectionInformation } from './ConnectionInformation'
import { DeviceInfo } from './DeviceInformation'
import { Settings } from '../Settings/Settings'
import { Gps } from '../DeviceShadow'
import { ReportedTime } from './ReportedTime'

import './Cat.scss'

const intro = introJs()

const ShowCat = ({
	catId,
	iot,
	iotData,
	onAvatarChange,
	onNameChange,
	identityId,
	credentials,
	children,
	map,
}: {
	iot: Iot
	iotData: IotData
	onAvatarChange: (args: { avatar: Blob }) => void
	onNameChange: (args: { name: string }) => void
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
		reported?: any
	})
	const { reported, desired } = state
	const [error, setError] = useState()

	useEffect(() => {
		let connection: device
		Promise.all([
			iot
				.describeThing({
					thingName: catId,
				})
				.promise(),
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
					setCat({
						name: (attributes && attributes.name) || thingName,
						avatar:
							(attributes && attributes.avatar) ||
							'https://placekitten.com/75/75',
						version: version || 0,
					})
				}
			})
			.catch(err => {
				setError(err)
				setLoading(false)
			})

		return () => {
			connection && connection.end()
		}
	}, [iot, iotData, catId, identityId, credentials])

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

	if (loading || error)
		return (
			<Card>
				<CardBody>
					{loading && <Loading text={`Opening can for ${catId}...`} />}
					{error && <Error error={error} />}
				</CardBody>
			</Card>
		)
	const hasMap =
		reported &&
		reported.gps &&
		reported.gps.v &&
		reported.gps.v.lat &&
		reported.gps.v.lng
	return (
		<>
			{hasMap && map({ gps: reported.gps })}
			{!hasMap && (
				<div className={'noMap'}>
					<span>
						<NoPositionIcon /> No position known.
					</span>
				</div>
			)}
			<Card className={'cat'}>
				<CardHeader>
					<AvatarPicker
						key={`${cat.version}`}
						onChange={blob => {
							// Display image directly
							const reader = new FileReader()
							reader.onload = (e: any) => {
								setCat({
									...cat,
									avatar: e.target.result,
								})
							}
							reader.readAsDataURL(blob)
							onAvatarChange({ avatar: blob })
						}}
					>
						<img
							src={cat.avatar}
							alt={cat.name}
							className={'avatar'}
							data-intro="Click here to upload a new image for your cat."
						/>
					</AvatarPicker>
					<h2 data-intro="Click here to edit the name of your cat.">
						<Editable
							key={`${cat.version}`}
							text={cat.name}
							onChange={v => {
								onNameChange({ name: v })
							}}
						/>
					</h2>
					{reported && (
						<>
							{reported.dev && reported.roam && (
								<ConnectionInformation
									device={reported.dev}
									roaming={reported.roam}
								/>
							)}
							{reported.gps && reported.gps.v && (
								<div>
									{reported.gps.v.spd && (
										<span>
											<SpeedIcon />
											{Math.round(reported.gps.v.spd.value)}m/s
										</span>
									)}
									{reported.gps.v.alt && (
										<span>
											<AltitudeIcon />
											{Math.round(reported.gps.v.alt.value)}m
										</span>
									)}
									<ReportedTime
										receivedAt={reported.gps.v.lat.receivedAt}
										reportedAt={new Date(reported.gps.ts.value)}
									/>
								</div>
							)}
							{reported.bat && reported.bat.v && (
								<div>
									<span>
										<BatteryIcon />
										{reported.bat.v.value / 1000}V
									</span>
									<span />
									<ReportedTime
										receivedAt={reported.bat.v.receivedAt}
										reportedAt={new Date(reported.bat.ts.value)}
									/>
								</div>
							)}
						</>
					)}
				</CardHeader>
				<CardBody>
					<Collapsable
						id={'cat:settings'}
						title={
							<h3>
								<SettingsIcon />
								<span>Settings</span>
							</h3>
						}
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
								title={
									<h3>
										<InfoIcon />
										<span>Device Information</span>
									</h3>
								}
							>
								<DeviceInfo
									key={`${cat.version}`}
									device={reported.dev}
									roaming={reported.roam}
								/>
							</Collapsable>
						</>
					)}
					{reported && reported.acc && reported.acc.v && (
						<>
							<hr />
							<Collapsable
								id={'cat:motion'}
								title={
									<h3>
										<SpeedIcon />
										<span>Motion</span>
									</h3>
								}
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
			</Card>
		</>
	)
}

const athenaWorkGroup =
	process.env.REACT_APP_HISTORICALDATA_WORKGROUP_NAME || ''
const athenaDataBase = process.env.REACT_APP_HISTORICALDATA_DATABASE_NAME || ''
const athenaRawDataTable = process.env.REACT_APP_HISTORICALDATA_TABLE_NAME || ''

export const Cat = ({ catId }: { catId: string }) => (
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
							return (
								<ShowCat
									catId={catId}
									iot={iot}
									iotData={iotData}
									identityId={identityId}
									credentials={credentials}
									onAvatarChange={({ avatar }) => {
										avatarUploader({
											avatar,
										})
											.then(async ({ url }) =>
												attributeUpdater({ avatar: url }),
											)
											.catch(err => {
												console.error(err)
											})
									}}
									onNameChange={({ name }) => {
										attributeUpdater({ name }).catch(err => {
											console.error(err)
										})
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
											QueryString={`SELECT reported.gps.ts as date, reported.gps.v.lat as lat, reported.gps.v.lng as lng FROM ${athenaDataBase}.${athenaRawDataTable} WHERE deviceId='${catId}' AND reported.gps IS NOT NULL ORDER BY reported.gps.ts DESC LIMIT 10`}
											workGroup={athenaWorkGroup}
											loading={
												<Map
													position={{
														lat: gps.v.lat.value,
														lng: gps.v.lng.value,
													}}
													accuracy={gps.v.acc.value}
													heading={gps.v.hdg.value}
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
													accuracy={gps.v.acc.value}
													heading={gps.v.hdg.value}
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
										title={
											<h3>
												<BatteryIcon />
												<span>Battery</span>
											</h3>
										}
									>
										<HistoricalDataLoader
											athena={athena}
											deviceId={catId}
											QueryString={`SELECT reported.bat.ts as date, reported.bat.v as value FROM ${athenaDataBase}.${athenaRawDataTable} WHERE deviceId='${catId}' AND reported.bat IS NOT NULL ORDER BY reported.bat.ts DESC LIMIT 100`}
											formatFields={{
												value: v => parseInt(v, 10) / 1000,
												date: v => new Date(v),
											}}
											workGroup={athenaWorkGroup}
										>
											{({ data }) => <HistoricalDataChart data={data} />}
										</HistoricalDataLoader>
									</Collapsable>
									<hr />
									<Collapsable
										id={'cat:act'}
										title={
											<h3>
												<ActivityIcon />
												<span>Activity</span>
											</h3>
										}
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
											{({ data }) => <HistoricalDataChart data={data} />}
										</HistoricalDataLoader>
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
