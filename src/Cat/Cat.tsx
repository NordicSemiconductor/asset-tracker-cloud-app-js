import React, { useEffect, useState } from 'react'
import { IdentityIdContext, IotContext, CredentialsContext } from '../App'
import { Card, CardHeader, CardBody, Alert } from 'reactstrap'
import { Iot, IotData, S3 } from 'aws-sdk'
import { Loading } from '../Loading/Loading'
import { Error } from '../Error/Error'
import { device } from 'aws-iot-device-sdk'
import { RelativeTime } from '../RelativeTime/RelativeTime'
import { Map } from '../Map/Map'
import { WarningRounded as WarningIcon } from '@material-ui/icons'

import './Cat.scss'
import { AvatarPicker } from '../Avatar/AvatarPicker'
import { updateAvatar } from '../Avatar/updateAvatar'

const ShowCat = ({
	catId,
	iot,
	iotData,
	avatarUploader,
	identityId,
	credentials,
}: {
	iot: Iot
	iotData: IotData
	avatarUploader: (args: { blob: Blob }) => Promise<{ url: string }>
	catId: string
	identityId: string
	credentials: {
		accessKeyId: string
		sessionToken: string
		secretAccessKey: string
	}
}) => {
	const [loading, setLoading] = useState(true)
	const [cat, setCat] = useState({
		name: catId,
		avatar: 'https://placekitten.com/75/75',
	})
	const [reported, setReported] = useState({} as {
		[key: string]: { v: any; ts: string }
	})
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
					const reported = JSON.parse(payload.toString()).current.state.reported
					setReported(reported)
					console.log('Update reported state', catId, reported)
				})
			}),
			iotData
				.getThingShadow({
					thingName: catId,
				})
				.promise()
				.then(({ payload }) =>
					payload ? JSON.parse(payload.toString()).state.reported : {},
				)
				.catch(err => {
					console.error(err)
					return {}
				}),
		])

			.then(([{ thingName, attributes }, connection, reported]) => {
				setLoading(false)
				console.log('Inital reported state', catId, reported)
				setReported(reported)
				if (thingName) {
					setCat({
						name: thingName,
						avatar:
							(attributes && attributes.avatar) ||
							'https://placekitten.com/75/75',
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
	if (loading) return <Loading text={`Opening can for ${catId}...`} />
	if (error) return <Error error={error} />
	return (
		<>
			{reported.gps && (
				<Map
					position={{
						lat: reported.gps.v.lat as number,
						lng: reported.gps.v.lng as number,
					}}
					label={catId}
				/>
			)}
			<Card>
				<CardHeader className={'cat'}>
					<AvatarPicker
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

              // Upload
							avatarUploader({ blob })
								.then(({ url }) => {
									setCat({
										...cat,
										avatar: url,
									})
								})
								.catch(error => {
									console.error(error)
								})
						}}
					>
						<img src={cat.avatar} alt={cat.name} className={'avatar'} />
					</AvatarPicker>

					<h2>{cat.name}</h2>
				</CardHeader>
				<CardBody>
					<dl>
						<dt>Last position</dt>
						{!reported.gps && (
							<dd>
								<Alert color={'danger'}>
									<WarningIcon /> Unknown!
								</Alert>
							</dd>
						)}
						{reported.gps && (
							<dd>
								updated{' '}
								<RelativeTime ts={reported.gps.ts} key={reported.gps.ts} />
							</dd>
						)}
						{reported && reported.bat && reported.bat.v && (
							<>
								<dt>Battery</dt>
								<dd>
									{reported.bat.v} (updated{' '}
									<RelativeTime ts={reported.bat.ts} key={reported.bat.ts} />)
								</dd>
							</>
						)}
					</dl>
				</CardBody>
			</Card>
		</>
	)
}

export const Cat = ({ catId }: { catId: string }) => (
	<CredentialsContext.Consumer>
		{credentials => {
			const s3 = new S3({
				credentials,
				region: process.env.REACT_APP_REGION,
			})
			return (
				<IdentityIdContext.Consumer>
					{identityId => (
						<IotContext.Consumer>
							{({ iot, iotData }) => (
								<ShowCat
									catId={catId}
									iot={iot}
									iotData={iotData}
									identityId={identityId}
									credentials={credentials}
									avatarUploader={updateAvatar({
										s3,
										iot,
										bucketName: `${process.env.REACT_APP_AVATAR_BUCKET_NAME}`,
										thingName: catId,
									})}
								/>
							)}
						</IotContext.Consumer>
					)}
				</IdentityIdContext.Consumer>
			)
		}}
	</CredentialsContext.Consumer>
)
