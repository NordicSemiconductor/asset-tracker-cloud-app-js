import * as querystring from 'querystring'
import { Twin } from 'azure-iothub'

const toQueryString = (obj: any): string => {
	if (!Object.keys(obj).length) {
		return ''
	}
	return '?' + querystring.stringify(obj)
}

export type ApiClient = {
	listDevices: () => Promise<Twin[]>
	getDevice: (id: string) => Promise<Twin>
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
	) => async (): Promise<A> => {
		const res = await fetch(
			`${endpoint}/api/${resource}${query ? toQueryString(query) : ''}`,
			{
				method: 'GET',
				headers: iotHubRequestHeaders,
			},
		)
		if (res.status >= 400) {
			const body = await res.text()
			throw new Error(
				`Failed to fetch: ${res.status}${body ? ` (${body})` : ''}`,
			)
		}
		return res.json()
	}

	return {
		listDevices: get<Twin[]>('listdevices'),
		getDevice: async (id: string) => get<Twin>(`device`, { id })(),
	}
}
