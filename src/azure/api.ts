import * as querystring from 'querystring'
import { Twin } from 'azure-iothub'
import { Either, right, left } from 'fp-ts/lib/Either'
import { ErrorInfo } from '../Error/ErrorInfo'

const toQueryString = (obj: any): string => {
	if (!Object.keys(obj).length) {
		return ''
	}
	return '?' + querystring.stringify(obj)
}

export type ApiClient = {
	listDevices: () => Promise<Either<ErrorInfo, Pick<Twin, 'deviceId'>[]>>
	getDevice: (id: string) => Promise<Either<ErrorInfo, Twin>>
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
	) => async (): Promise<Either<ErrorInfo, A>> => {
		const res = await fetch(
			`${endpoint}/api/${resource}${query ? toQueryString(query) : ''}`,
			{
				method: 'GET',
				headers: iotHubRequestHeaders,
			},
		)
		const json = await res.json()
		if (res.status >= 400) {
			return left(json)
		}
		return right(json)
	}

	return {
		listDevices: get<Pick<Twin, 'deviceId'>[]>('devices'),
		getDevice: async (id: string) => get<Twin>(`device/${id}`)(),
	}
}
