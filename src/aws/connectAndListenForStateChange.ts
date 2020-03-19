import { DesiredConfig } from '../Settings/Settings'
import { DeviceShadow } from '../@types/DeviceShadow'
import { ICredentials } from '@aws-amplify/core'
import { device } from 'aws-iot-device-sdk'
import { mergeReportedAndMetadata } from '../util/mergeReportedAndMetadata'
import { parseMessage } from '../util/parseMessage'
import { Message } from '../@types/Message'

export type AWSIotThingState = {
	desired?: { cfg?: Partial<DesiredConfig> }
	reported?: Partial<DeviceShadow>
}

const topics = (deviceId: string) => ({
	stateUpdates: `$aws/things/${deviceId}/shadow/update/documents`,
	messages: `${deviceId}/messages`,
})

export const connectAndListenForStateChange = async ({
	clientId,
	deviceId,
	credentials,
	onNewState,
	onMessage,
}: {
	clientId: string
	credentials: ICredentials
	deviceId: string
	onNewState: (newState: AWSIotThingState) => void
	onMessage: (message: Message) => void
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
		const t = topics(deviceId)
		connection.on('connect', async () => {
			console.log('[Iot]', `connected ${clientId}`)
			await Promise.all([
				new Promise(resolve =>
					connection.subscribe(t.stateUpdates, undefined, resolve),
				),
				new Promise(resolve =>
					connection.subscribe(t.messages, undefined, resolve),
				),
			])
			resolve(connection)
		})
		connection.on('message', (topic, payload) => {
			if (topic === t.stateUpdates) {
				const shadow = JSON.parse(payload.toString()).current
				const newState = {
					reported: mergeReportedAndMetadata({
						shadow,
					}),
					desired: shadow.state.desired,
				} as AWSIotThingState
				onNewState(newState)
				console.log('Updated state', deviceId, newState)
			} else {
				try {
					const msg = JSON.parse(payload.toString())
					onMessage(parseMessage(msg))
				} catch (error) {
					console.error(
						`Failed to parse message as JSON: "${payload.toString()}"!`,
					)
				}
			}
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
