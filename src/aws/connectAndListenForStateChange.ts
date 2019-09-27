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
		const connectArgs = {
			clientId,
			region: process.env.REACT_APP_REGION,
			host: process.env.REACT_APP_MQTT_ENDPOINT,
			protocol: 'wss',
			accessKeyId: credentials.accessKeyId,
			sessionToken: credentials.sessionToken,
			secretKey: credentials.secretAccessKey,
		} as const
		console.log('[Iot]', `Connecting ${clientId}...`, connectArgs)
		const connection = new device(connectArgs)
		connection.on('connect', async () => {
			console.log('[Iot]', `connected ${clientId}`)
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
		connection.on('error', () => {
			console.error('[Iot]', 'error', clientId)
		})
		connection.on('offline', () => {
			console.log('[Iot]', 'offline', clientId)
		})
		connection.on('close', () => {
			console.log('[Iot]', 'close', clientId)
		})
	})
