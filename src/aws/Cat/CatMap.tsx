import { Location, CellLocation } from '../../Map/Map'
import React, { useState, useEffect } from 'react'
import { TimestreamQueryContextType } from '../App'
import { geolocateCell } from '../geolocateCell'
import { isRight } from 'fp-ts/lib/Either'
import { CatInfo } from './Cat'
import { ThingState } from '../../@types/aws-device'
import { HistoricalDataMap } from '../../Map/HistoricalDataMap'

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
				accuracy: reported.gps.v.acc,
				altitude: reported.gps.v.alt,
				heading: reported.gps.v.hdg,
				speed: reported.gps.v.spd,
			},
		}
	}

	return (
		<HistoricalDataMap
			deviceLocation={deviceLocation}
			cellLocation={cellLocation}
			cat={cat}
			fetchHistory={async (numEntries) =>
				timestreamQueryContext
					.query<{
						objectValues: string[]
						objectKeys: string[]
						date: Date
					}>(
						(table) => `SELECT
				array_agg(measure_value::double) AS objectValues,
				array_agg(measure_name) AS objectKeys,
				time AS date
				FROM ${table}
				WHERE deviceId='${cat.id}' 
				AND measureGroup IN (
					-- Select the last 100 GPS measures
					SELECT
					measureGroup
					FROM ${table}
					WHERE deviceId='${cat.id}' 
					AND substr(measure_name, 1, 4) = 'gps.'
					GROUP BY measureGroup, time
					ORDER BY time DESC
					LIMIT ${numEntries}
				)
				AND substr(measure_name, 1, 4) = 'gps.'
				GROUP BY measureGroup, time
				ORDER BY time DESC`,
					)
					.then((data) =>
						data.map(({ objectValues, objectKeys, date }) => {
							const pos = objectKeys.reduce(
								(obj, k, i) => ({ ...obj, [k.split('.')[1]]: objectValues[i] }),
								{} as {
									lat: number
									lng: number
									acc: number
									alt: number
									hdg: number
									spd: number
								},
							)
							const l: Location = {
								position: {
									lat: pos.lat,
									lng: pos.lng,
									accuracy: pos.acc,
									heading: pos.hdg,
									altitude: pos.alt,
									speed: pos.spd,
								},
								ts: (date as unknown) as Date,
							}
							return l
						}),
					)
			}
		/>
	)
}
