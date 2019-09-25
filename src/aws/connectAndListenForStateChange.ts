import { DesiredConfig } from '../Settings/Settings'
import { DeviceShadow } from '../@types/DeviceShadow'
import { ICredentials } from '@aws-amplify/core'
import { device } from 'aws-iot-device-sdk'
import { mergeReportedAndMetadata } from '../util/mergeReportedAndMetadata'

export type AWSIotThingState = {
	desired?: { cfg?: Partial<DesiredConfig> }
	reported?: Partial<DeviceShadow>
}
export const connectAndListenForStateChange = async ({
	clientId,
	deviceId,
	credentials,
	onNewState,
}: {
	clientId: string
	credentials: ICredentials
	deviceId: string
	onNewState: (newState: AWSIotThingState) => void
}): Promise<device> =>
	new Promise(resolve => {
		console.log('Connecting ...')
		const connection = new device({
			clientId,
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
				`$aws/things/${deviceId}/shadow/update/documents`,
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
			} as AWSIotThingState
			onNewState(newState)
			console.log('Updated state', deviceId, newState)
		})
	})
