import { ICredentials } from '@aws-amplify/core'
import { device } from 'aws-iot-device-sdk'
import { parseMessage } from '../util/parseMessage'
import { Message } from '../@types/Message'

export const connectAndListenForMessages = async ({
	clientId,
	credentials,
	onMessage,
}: {
	clientId: string
	credentials: ICredentials
	onMessage: (message: { deviceId: string; message: Message }) => void
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
			connection.subscribe('+/messages', undefined, () => {
				console.log('[Iot]', `subscribed to`, '+/messages')
				resolve(connection)
			})
		})
		connection.on('message', (topic, payload) => {
			const [deviceId] = topic.split('/')
			try {
				const msg = JSON.parse(payload.toString())
				onMessage({
					deviceId,
					message: parseMessage(msg),
				})
			} catch (error) {
				console.error(
					`Failed to parse message as JSON: "${payload.toString()}"!`,
				)
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
