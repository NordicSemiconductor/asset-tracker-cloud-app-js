import * as querystring from 'querystring'
import { Twin } from 'azure-iothub'
import { Either, right, left, isLeft } from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/pipeable'
import { ErrorInfo } from '../Error/ErrorInfo'
import { DeviceTwin } from '../@types/azure-device'
import { DeviceConfig } from '../@types/device-state'

const toQueryString = (obj: any): string => {
	if (Object.keys(obj).length === 0) {
		return ''
	}
	return '?' + querystring.stringify(obj)
}

export type Device = {
	name?: string
	avatar?: string
	version: number
	state: DeviceTwin
}

export type ApiClient = {
	listDevices: () => Promise<
		Either<ErrorInfo, { deviceId: string; name?: string }[]>
	>
	getDevice: (id: string) => Promise<Either<ErrorInfo, Device>>
	deleteDevice: (id: string) => Promise<Either<ErrorInfo, { success: boolean }>>
	setDeviceConfig: (
		id: string,
		config: Partial<DeviceConfig>,
	) => Promise<Either<ErrorInfo, { success: boolean }>>
	setDeviceName: (
		id: string,
		name: string,
	) => Promise<Either<ErrorInfo, { success: boolean }>>
	setDeviceAvatar: (
		id: string,
		url: string,
	) => Promise<Either<ErrorInfo, { success: boolean }>>
	storeImage: (image: Blob) => Promise<Either<ErrorInfo, { url: string }>>
	storeDeviceUpgrade: (
		firmware: File,
	) => Promise<Either<ErrorInfo, { url: string }>>
	setPendingDeviceUpgrade: ({
		id,
		url,
		version,
	}: {
		id: string
		url: string
		version: string
	}) => Promise<Either<ErrorInfo, { success: boolean }>>
	getSignalRConnectionInfo: () => Promise<
		Either<ErrorInfo, { url: string; accessToken: string }>
	>
	queryHistoricalDeviceData: (
		query: string,
	) => Promise<Either<ErrorInfo, { result: unknown }>>
	geolocateCell: (args: {
		cell: number
		area: number
		mccmnc: number
	}) => Promise<
		Either<ErrorInfo, { lat: number; lng: number; accuracy: number }>
	>
}

export type IotHubDevice = Twin & {
	deviceEtag: string
	status: 'enabled' | 'disabled'
	statusUpdateTime: string
	connectionState: 'Disconnected' | 'Connected'
	lastActivityTime: string
	cloudToDeviceMessageCount: number
	version: number
	properties: DeviceTwin
	tags: {
		name?: string
		avatar?: string
	}
	capabilities: {
		iotEdge: boolean
	}
}

const handleResponse = async <A extends { [key: string]: any }>(
	r: Promise<Response>,
): Promise<Either<ErrorInfo, A>> => {
	const res = await r
	if (res.status >= 400) {
		if (
			parseInt(res.headers?.get('content-length') ?? '0') > 2 &&
			(res.headers?.get('content-type')?.includes('application/json') ?? false)
		) {
			const json = await res.json()
			return left(json)
		}
		return left({
			type: 'IntegrationError',
			message: `${res.status} ${await res.text()}`.trim(),
		})
	}
	return right(await res.json())
}

export const fetchApiClient = ({
	endpoint,
	token,
}: {
	endpoint: string
	token: string
}): ApiClient => {
	const iotHubRequestHeaders = new Headers()
	iotHubRequestHeaders.append('Authorization', 'Bearer ' + token)
	iotHubRequestHeaders.append('Content-Type', 'application/json')
	const get = <A extends { [key: string]: any }>(
		resource: string,
		query?: { [key: string]: any },
	) => async (): Promise<Either<ErrorInfo, A>> =>
		handleResponse(
			fetch(
				`${endpoint}/api/${resource}${
					query !== undefined ? toQueryString(query) : ''
				}`,
				{
					method: 'GET',
					headers: iotHubRequestHeaders,
				},
			),
		)

	const patch = <A extends { [key: string]: any }>(
		resource: string,
		properties: { [key: string]: any },
	) => async (): Promise<Either<ErrorInfo, A>> =>
		handleResponse(
			fetch(`${endpoint}/api/${resource}`, {
				method: 'PATCH',
				headers: iotHubRequestHeaders,
				body: JSON.stringify(properties),
			}),
		)

	const post = <A extends { [key: string]: any }>(
		resource: string,
		properties: { [key: string]: any },
	) => async (): Promise<Either<ErrorInfo, A>> =>
		handleResponse(
			fetch(`${endpoint}/api/${resource}`, {
				method: 'POST',
				headers: iotHubRequestHeaders,
				body: JSON.stringify(properties),
			}),
		)

	const del️ = <A extends { [key: string]: any }>(
		resource: string,
	) => async (): Promise<Either<ErrorInfo, A>> =>
		handleResponse(
			fetch(`${endpoint}/api/${resource}`, {
				method: 'DELETE',
				headers: iotHubRequestHeaders,
			}),
		)

	const postRaw = <A extends { [key: string]: any }>(
		resource: string,
		body: any,
	) => async (): Promise<Either<ErrorInfo, A>> => {
		const iotHubRequestHeaders = new Headers()
		iotHubRequestHeaders.append('Authorization', 'Bearer ' + token)
		return handleResponse(
			fetch(`${endpoint}/api/${resource}`, {
				method: 'POST',
				headers: iotHubRequestHeaders,
				body,
			}),
		)
	}
	return {
		listDevices: get<{ deviceId: string; name?: string }[]>('devices'),
		getDevice: async (id: string): Promise<Either<ErrorInfo, Device>> => {
			const d = await get<IotHubDevice>(`device/${id}`)()
			if (isLeft(d)) return d
			return right({
				name: d.right.tags?.name,
				avatar: d.right.tags?.avatar,
				version: d.right.version,
				state: d.right.properties,
			})
		},
		deleteDevice: async (
			id: string,
		): Promise<Either<ErrorInfo, { success: boolean }>> =>
			del️<{ success: boolean }>(`device/${id}`)(),
		setDeviceName: async (
			id: string,
			name: string,
		): Promise<Either<ErrorInfo, { success: boolean }>> =>
			patch<{ success: boolean }>(`device/${id}`, { name })(),
		setDeviceAvatar: async (
			id: string,
			url: string,
		): Promise<Either<ErrorInfo, { success: boolean }>> =>
			patch<{ success: boolean }>(`device/${id}`, { avatar: url })(),
		setDeviceConfig: async (
			id: string,
			config: Partial<DeviceConfig>,
		): Promise<Either<ErrorInfo, { success: boolean }>> =>
			patch<{ success: boolean }>(`device/${id}`, { config })(),
		storeImage: async (
			image: Blob,
		): Promise<Either<ErrorInfo, { url: string }>> =>
			new Promise((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = async () => {
					postRaw<{ url: string }>(
						`images`,
						(reader.result as string).split(',')[1],
					)()
						.then(resolve)
						.catch(reject)
				}
				reader.readAsDataURL(image)
			}),
		storeDeviceUpgrade: async (
			file: File,
		): Promise<Either<ErrorInfo, { url: string }>> =>
			new Promise((resolve, reject) => {
				const reader = new FileReader()
				reader.onload = async () => {
					postRaw<{ url: string }>(
						`firmware`,
						(reader.result as string).split(',')[1],
					)()
						.then(resolve)
						.catch(reject)
				}
				reader.readAsDataURL(file)
			}),
		setPendingDeviceUpgrade: async ({
			id,
			url,
			version,
		}: {
			id: string
			url: string
			version: string
		}): Promise<Either<ErrorInfo, { success: boolean }>> =>
			pipe(
				patch<{ success: boolean }>(`device/${id}`, {
					firmware: {
						fwVersion: version,
						fwPackageURI: url,
					},
				}),
				TE.map(({ success }) => ({ success })),
			)(),
		getSignalRConnectionInfo: get<{ url: string; accessToken: string }>(
			'signalRConnectionInfo',
		),
		queryHistoricalDeviceData: async (
			query: string,
		): Promise<Either<ErrorInfo, { result: unknown }>> =>
			post<{ result: any }>('history', { query })(),
		geolocateCell: async (args: {
			cell: number
			area: number
			mccmnc: number
		}): Promise<
			Either<ErrorInfo, { lat: number; lng: number; accuracy: number }>
		> =>
			get<{ lat: number; lng: number; accuracy: number }>('cellgeolocation', {
				...args,
			})(),
	}
}
