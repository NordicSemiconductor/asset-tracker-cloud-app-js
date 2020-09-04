import { ICredentials } from '@aws-amplify/core'
import { device } from 'aws-iot-device-sdk'
import { parseMessage } from '../util/parseMessage'
import { Message } from '../@types/Message'
import { ThingState } from '../@types/aws-device'

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
	region,
	mqttEndpoint,
}: {
	clientId: string
	credentials: ICredentials
	deviceId: string
	onNewState: (newState: ThingState) => void
	onMessage?: (message: Message) => void
	region: string
	mqttEndpoint: string
}): Promise<device> =>
	new Promise((resolve) => {
		const connectArgs = {
			clientId,
			region,
			host: mqttEndpoint,
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
				new Promise((resolve) =>
					connection.subscribe(t.stateUpdates, undefined, resolve),
				),
				new Promise((resolve) =>
					connection.subscribe(t.messages, undefined, resolve),
				),
			])
			resolve(connection)
		})
		connection.on('message', (topic, payload) => {
			if (topic === t.stateUpdates) {
				const shadow = JSON.parse(payload.toString()).current
				const newState = {
					reported: shadow.state.reported,
					desired: shadow.state.desired,
					metadata: shadow.metadata,
				}
				console.log('Updated state', deviceId, newState)
				onNewState(newState)
			} else {
				try {
					// eslint-disable-next-line @typescript-eslint/no-unused-expressions
					onMessage?.(parseMessage(JSON.parse(payload.toString())))
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
