import React, { useContext, useEffect, useState } from 'react'
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
	Star as PersonalizationIcon,
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
import { DeviceShadow, Gps } from '../DeviceShadow'
import { ReportedTime } from './ReportedTime'
import { NavbarBrandContext } from '../Navigation/NavbarBrand'
import { CatNavbar } from './CatNavbar'

import './Cat.scss'
import { TextWithIcon } from '../TextWithIcon/TextWithIcon'
import { Toggle } from '../Toggle/Toggle'

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
	}, [iot, iotData, catId, identityId, credentials, setNavbar, resetNavbar])

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
			{!hasMap && (
				<div className={'noMap'}>
					<TextWithIcon icon={<NoPositionIcon />}>
						No position known.
					</TextWithIcon>
				</div>
			)}
			<Card className={'cat'}>
				<CardHeader>
					<AvatarPicker
						key={`${cat.version}`}
						className={'showOnDesktop'}
						onChange={onAvatarUploaded}
					>
						<img src={cat.avatar} alt={cat.name} className={'avatar'} />
					</AvatarPicker>
					<h2 className={'showOnDesktop'}>
						<Editable
							key={`${cat.version}`}
							text={cat.name}
							onChange={onNameChanged}
						/>
					</h2>
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
										{reported.gps.v.spd && (
											<TextWithIcon icon={<SpeedIcon />}>
												{`${Math.round(reported.gps.v.spd.value)}m/s`}
											</TextWithIcon>
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
								</Toggle>
							)}
							{reported.bat && reported.bat.v && (
								<Toggle>
									<div className={'info'}>
										<TextWithIcon icon={<BatteryIcon />}>{`${reported.bat.v
											.value / 1000}V`}</TextWithIcon>
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
						className={'personalization'}
						title={
							<h3>
								<TextWithIcon icon={<PersonalizationIcon />}>
									Personalization
								</TextWithIcon>
							</h3>
						}
					>
						<dl>
							<dt>Name</dt>
							<dd data-intro="Click here to edit the name of your cat.">
								<Editable
									key={`${cat.version}`}
									text={cat.name}
									onChange={onNameChanged}
								/>
							</dd>
						</dl>
						<AvatarPicker
							key={`${cat.version}`}
							className={'hideOnDesktop'}
							onChange={onAvatarUploaded}
						>
							<img
								src={cat.avatar}
								alt={cat.name}
								className={'avatar'}
								data-intro="Click here to upload a new image for your cat."
							/>
						</AvatarPicker>
					</Collapsable>
					<hr className={'hideOnDesktop'} />
					<Collapsable
						id={'cat:settings'}
						title={
							<h3>
								<TextWithIcon icon={<SettingsIcon />}>Settings</TextWithIcon>
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
										<TextWithIcon icon={<InfoIcon />}>
											Device Information
										</TextWithIcon>
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
										<TextWithIcon icon={<SpeedIcon />}>Motion</TextWithIcon>
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
												<TextWithIcon icon={<BatteryIcon />}>
													Battery
												</TextWithIcon>
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
												<TextWithIcon icon={<ActivityIcon />}>
													Activity
												</TextWithIcon>
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
