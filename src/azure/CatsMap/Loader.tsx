import { isRight } from 'fp-ts/lib/Either'
import { useEffect, useState } from 'react'
import { CatLocation, Map } from '../../CatsMap/Map'
import { ApiClient } from '../api'

export const CatMapLoader = ({ apiClient }: { apiClient: ApiClient }) => {
	const [cats, setCats] = useState([] as CatLocation[])

	useEffect(() => {
		let isCancelled = false

		// Cosmos DB cannot do GROUP BY and ORDER BY simultaneously

		apiClient
			.queryHistoricalDeviceData(
				'SELECT c.deviceId, MAX(c.timestamp) AS max_timestamp FROM c WHERE c.deviceUpdate.properties.reported.gnss != null GROUP BY c.deviceId',
			)
			.then(async (res) => {
				if (isRight(res)) {
					const q = `SELECT c.deviceId, c.deviceUpdate.properties.reported.gnss.v FROM c WHERE c.deviceId IN (${(
						res.right.result as { deviceId: string }[]
					).map(
						(s) => `"${s.deviceId}"`,
					)}) AND c.deviceUpdate.properties.reported.gnss != null AND c.timestamp IN (${(
						res.right.result as { max_timestamp: string }[]
					).map((s) => `"${s.max_timestamp}"`)})`
					return apiClient.queryHistoricalDeviceData(q).then((res) => {
						if (isRight(res)) {
							if (!isCancelled)
								setCats(
									(
										res.right.result as {
											deviceId: string
											v: { lat: number; lng: number }
										}[]
									).map((s) => ({
										lat: s.v.lat,
										lng: s.v.lng,
										id: s.deviceId,
										name: s.deviceId,
									})),
								)
						}
					})
				}
			})
			.catch(console.error)

		return () => {
			isCancelled = true
		}
	}, [apiClient])

	return <Map cats={cats} />
}
