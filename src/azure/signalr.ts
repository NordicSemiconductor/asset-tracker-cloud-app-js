import { ApiClient } from './api'
import { isRight } from 'fp-ts/lib/Either'
import * as signalR from '@microsoft/signalr'

export const connect = async (
	apiClient: ApiClient,
): Promise<signalR.HubConnection> =>
	new Promise((resolve, reject) => {
		apiClient
			.getSignalRConnectionInfo()
			.then(async (maybeConnectionInfo) => {
				if (isRight(maybeConnectionInfo)) {
					const connection = new signalR.HubConnectionBuilder()
						.withUrl(maybeConnectionInfo.right.url, {
							accessTokenFactory: () => maybeConnectionInfo.right.accessToken,
						})
						.build()
					connection
						.start()
						.then(() => {
							resolve(connection)
						})
						.catch(reject)
				} else {
					reject(maybeConnectionInfo.left)
				}
			})
			.catch(reject)
	})
