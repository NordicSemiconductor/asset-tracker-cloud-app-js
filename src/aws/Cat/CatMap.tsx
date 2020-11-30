import { Location, CellLocation } from '../../Map/Map'
import React, { useState, useEffect } from 'react'
import { TimestreamQueryContextType } from '../App'
import { geolocateCell } from '../geolocateCell'
import { isRight } from 'fp-ts/lib/Either'
import { CatInfo } from './Cat'
import { ThingState } from '../../@types/aws-device'
import { HistoricalDataMap } from '../../Map/HistoricalDataMap'
import { parseResult } from '@bifravst/timestream-helpers'

export const CatMap = ({
	timestreamQueryContext,
	cat,
	state: { reported },
	geolocationApiEndpoint,
}: {
	timestreamQueryContext: TimestreamQueryContextType
	cat: CatInfo
	state: ThingState
	geolocationApiEndpoint: string
}) => {
	const [cellLocation, setCellLocation] = useState<CellLocation>()

	useEffect(() => {
		let isCancelled = false
		if (reported.roam) {
			const { v, ts } = reported.roam
			geolocateCell(geolocationApiEndpoint)(v)
				.then((geolocation) => {
					if (isCancelled) return
					if (isRight(geolocation)) {
						const l: CellLocation = {
							ts: new Date(ts),
							position: geolocation.right,
						}
						setCellLocation(l)
					}
				})
				.catch((err) => {
					console.error('[geolocateCell]', err)
				})
		}
		return () => {
			isCancelled = true
		}
	}, [reported, geolocationApiEndpoint])

	let deviceLocation: Location | undefined = undefined

	if (reported.gps !== undefined) {
		deviceLocation = {
			ts: new Date(reported.gps.ts),
			position: {
				lat: reported.gps.v.lat,
				lng: reported.gps.v.lng,
			},
		}
	}

	return (
		<HistoricalDataMap
			deviceLocation={deviceLocation}
			cellLocation={cellLocation}
			cat={cat}
			fetchHistory={async (numEntries) =>
				timestreamQueryContext.timestreamQuery
					.query({
						QueryString: `SELECT
					array_agg(measure_value::double) AS values,
					array_agg(measure_name) AS keys,
					time AS date
					FROM "${timestreamQueryContext.db}"."${timestreamQueryContext.table}" 
					WHERE deviceId='${cat.id}' 
					AND measureGroup IN (
						-- Select the last 100 GPS measures
						SELECT
						measureGroup
						FROM "${timestreamQueryContext.db}"."${timestreamQueryContext.table}" 
						WHERE deviceId='${cat.id}' 
						AND substr(measure_name, 1, 4) = 'gps.'
						GROUP BY measureGroup, time
						ORDER BY time DESC
						LIMIT ${numEntries}
					)
					AND substr(measure_name, 1, 4) = 'gps.'
					GROUP BY measureGroup, time
					ORDER BY time DESC`,
					})
					.promise()
					.then((res) =>
						parseResult<{
							values: string[]
							keys: string[]
							date: Date
						}>(res),
					)
					.then((data) =>
						data.map(({ values, keys, date }) => ({
							position: keys.reduce(
								(obj, k, i) => ({ ...obj, [k]: values[i] }),
								{} as { lat: number; lng: number },
							),
							ts: (date as unknown) as Date,
						})),
					)
			}
		/>
	)
}
