import * as querystring from 'querystring'
import { Twin } from 'azure-iothub'
import { Either, right, left, isLeft } from 'fp-ts/lib/Either'
import { ErrorInfo } from '../Error/ErrorInfo'

const toQueryString = (obj: any): string => {
	if (!Object.keys(obj).length) {
		return ''
	}
	return '?' + querystring.stringify(obj)
}

export type Device = {
	name?: string
	version: number
}

export type ApiClient = {
	listDevices: () => Promise<
		Either<ErrorInfo, { deviceId: string; name?: string }[]>
	>
	getDevice: (id: string) => Promise<Either<ErrorInfo, Device>>
	setDeviceName: (
		id: string,
		name: string,
	) => Promise<Either<ErrorInfo, { success: boolean }>>
}

export type IotHubDevice = Twin & {
	deviceEtag: string
	status: 'enabled' | 'disabled'
	statusUpdateTime: string
	connectionState: 'Disconnected' | 'Connected'
	lastActivityTime: string
	cloudToDeviceMessageCount: number
	version: number
	properties: {
		desired: {
			$metadata: {
				$lastUpdated: string
			}
			$version: number
		}
		reported: {
			$metadata: {
				$lastUpdated: string
			}
			$version: number
		}
	}
	tags: {
		name?: string
	}
	capabilities: {
		iotEdge: boolean
	}
}

const handleResponse = async (r: Promise<Response>) => {
	const res = await r
	if (res.status >= 400) {
		if (
			res.headers?.get('content-length') &&
			res.headers?.get('content-type')?.includes('application/json')
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
	const get = <A extends object>(
		resource: string,
		query?: object,
	) => async (): Promise<Either<ErrorInfo, A>> =>
		handleResponse(
			fetch(`${endpoint}/api/${resource}${query ? toQueryString(query) : ''}`, {
				method: 'GET',
				headers: iotHubRequestHeaders,
			}),
		)

	const patch = <A extends object>(
		resource: string,
		properties: object,
	) => async (): Promise<Either<ErrorInfo, A>> =>
		handleResponse(
			fetch(`${endpoint}/api/${resource}`, {
				method: 'PATCH',
				headers: iotHubRequestHeaders,
				body: JSON.stringify(properties),
			}),
		)
	return {
		listDevices: get<{ deviceId: string; name?: string }[]>('devices'),
		getDevice: async (id: string) => {
			const d = await get<IotHubDevice>(`device/${id}`)()
			if (isLeft(d)) return d
			return right({
				name: d.right.tags?.name,
				version: d.right.version,
			})
		},
		setDeviceName: async (id: string, name: string) =>
			patch<{ success: boolean }>(`device/${id}`, { name })(),
	}
}
