import { ApiClient } from './api'
import * as signalR from '@microsoft/signalr'
import * as TE from 'fp-ts/lib/TaskEither'
import { ErrorInfo } from '../Error/ErrorInfo'
import { pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/Either'

export const connect = (
	apiClient: ApiClient,
): TE.TaskEither<ErrorInfo, signalR.HubConnection> =>
	pipe(
		apiClient.getSignalRConnectionInfo,
		TE.chain(({ url, accessToken }) =>
			pipe(
				E.tryCatch(
					() =>
						new signalR.HubConnectionBuilder()
							.withUrl(url, {
								accessTokenFactory: () => accessToken,
							})
							.build(),
					(err: unknown): ErrorInfo => ({
						type: 'IntegrationError',
						message: `Failed to initate SignalR connection: ${
							(err as Error).message
						}`,
					}),
				),
				TE.fromEither,
			),
		),
		TE.chain((connection) =>
			TE.tryCatch(
				async () => {
					await connection.start()
					return connection
				},
				(err: unknown): ErrorInfo => {
					if ((err as signalR.HttpError).statusCode === 429) {
						return {
							type: 'LimitExceededError',
							message: `Failed to connect to SignalR: Too many connections.`,
						}
					}
					return {
						type: 'IntegrationError',
						message: `Failed to connect to SignalR: ${(err as Error).message}`,
					}
				},
			),
		),
	)
