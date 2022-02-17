import { isRight } from 'fp-ts/lib/Either'
import { isSome, Option } from 'fp-ts/lib/Option'
import React, { useEffect, useState } from 'react'
import { ThingState } from '../../@types/aws-device'
import { NCellMeasReport } from '../../@types/device-state'
import { HistoricalDataMap } from '../../Map/HistoricalDataMap'
import { CellLocation, Location, Roaming } from '../../Map/Map'
import { TimestreamQueryContextType } from '../App'
import { geolocateCell } from '../geolocateCell'
import { geolocatNeighboringCellReport } from '../geolocatNeighboringCellReport'
import { CatInfo } from './Cat'

export const CatMap = ({
	timestreamQueryContext,
	cat,
	state: { reported },
	geolocationApiEndpoint,
	neighboringCellGeolocationApiEndpoint,
	getNeighboringCellMeasurementReport,
}: {
	timestreamQueryContext: TimestreamQueryContextType
	cat: CatInfo
	state: ThingState
	geolocationApiEndpoint: string
	neighboringCellGeolocationApiEndpoint: string
	getNeighboringCellMeasurementReport: () => Promise<Option<NCellMeasReport>>
}) => {
	// Cell geolocation
	const [cellLocation, setCellLocation] = useState<CellLocation>()
	useEffect(() => {
		let isCancelled = false
		if (
			reported.roam?.v !== undefined &&
			typeof reported.roam.v === 'object' &&
			reported.dev?.v !== undefined &&
			typeof reported.dev.v === 'object' &&
			'area' in reported.roam.v &&
			'mccmnc' in reported.roam.v &&
			'cell' in reported.roam.v &&
			'nw' in reported.dev.v
		) {
			const { v, ts } = reported.roam
			geolocateCell(geolocationApiEndpoint)({
				...v,
				nw: reported.roam?.v?.nw?.includes('NB-IoT') ? 'nbiot' : 'ltem',
			})
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

	// Neighboring cell geolocation
	const [neighboringCellGeoLocation, setNeighboringCellGeoLocation] =
		useState<CellLocation>()
	useEffect(() => {
		let isCancelled = false
		void getNeighboringCellMeasurementReport().then(
			(maybeNeighborCellMeasurementReport) => {
				if (isSome(maybeNeighborCellMeasurementReport)) {
					const { position, nmr, unresolved, reportId, reportedAt } =
						maybeNeighborCellMeasurementReport.value
					if (position !== undefined) {
						setNeighboringCellGeoLocation({
							position: position,
							ts: reportedAt,
						})
					} else if ((nmr?.length ?? 0) === 0) {
						// No neighboring cells
						console.debug(
							'[neighboringCellGeolocation]',
							`Report ${reportId} has no neighboring cells`,
						)
					} else if (
						unresolved === undefined // This report has not yet been resolved
					) {
						geolocatNeighboringCellReport(
							neighboringCellGeolocationApiEndpoint,
						)({
							reportId: reportId,
						})
							.then((geolocation) => {
								if (isCancelled) return
								if (isRight(geolocation)) {
									const l: CellLocation = {
										ts: reportedAt,
										position: geolocation.right,
									}
									setNeighboringCellGeoLocation(l)
								}
							})
							.catch((err) => {
								console.error('[neighboringCellGeolocation]', err)
							})
					}
				}
			},
		)
		return () => {
			isCancelled = true
		}
	}, [
		getNeighboringCellMeasurementReport,
		neighboringCellGeolocationApiEndpoint,
	])

	let deviceLocation: Location | undefined = undefined

	if (
		reported.gnss?.v !== undefined &&
		typeof reported.gnss.v === 'object' &&
		'lat' in reported.gnss.v &&
		'lng' in reported.gnss.v
	) {
		deviceLocation = {
			ts: new Date(reported.gnss.ts),
			position: {
				lat: reported.gnss.v.lat,
				lng: reported.gnss.v.lng,
				accuracy: reported.gnss.v.acc,
				altitude: reported.gnss.v.alt,
				heading: reported.gnss.v.hdg,
				speed: reported.gnss.v.spd,
			},
		}
	}

	return (
		<HistoricalDataMap
			deviceLocation={deviceLocation}
			cellLocation={cellLocation}
			neighboringCellGeoLocation={neighboringCellGeoLocation}
			cat={cat}
			fetchHistory={async (numEntries) =>
				timestreamQueryContext
					.query<{
						objectValues: string[]
						objectKeys: string[]
						objectSource: string[]
						date: Date
					}>(
						(table) => `SELECT
							array_agg(measure_value::double) AS objectValues,
							array_agg(measure_name) AS objectKeys,
							array_agg(source) AS objectSource,
							time AS date
							FROM ${table}
							WHERE deviceId='${cat.id}' 
							AND measureGroup IN (
								SELECT
								measureGroup
								FROM ${table}
								WHERE deviceId='${cat.id}' 
								AND substr(measure_name, 1, 5) = 'gnss.'
								GROUP BY measureGroup, time
								ORDER BY time DESC
								LIMIT ${numEntries}
							)
							AND substr(measure_name, 1, 5) = 'gnss.'
							GROUP BY measureGroup, time
							ORDER BY time DESC`,
					)
					.then(
						(data) =>
							data
								.map(({ objectValues, objectKeys, date, objectSource }) => {
									const pos = objectKeys.reduce(
										(obj, k, i) => ({
											...obj,
											[k.split('.')[1]]: {
												v: objectValues[i],
												source: objectSource[i],
											},
										}),
										{} as {
											lat: {
												v: number
												source?: 'batch'
											}
											lng: {
												v: number
												source?: 'batch'
											}
											acc: {
												v: number
												source?: 'batch'
											}
											alt: {
												v: number
												source?: 'batch'
											}
											hdg: {
												v: number
												source?: 'batch'
											}
											spd: {
												v: number
												source?: 'batch'
											}
										},
									)
									if (typeof pos !== 'object') return undefined
									if (!('lat' in pos) || !('lng' in pos)) return undefined
									const l: Location = {
										position: {
											lat: pos.lat.v,
											lng: pos.lng.v,
											accuracy: pos.acc.v,
											heading: pos.hdg.v,
											altitude: pos.alt.v,
											speed: pos.spd.v,
										},
										batch: [
											pos.lat.source,
											pos.lng.source,
											pos.acc.source,
											pos.hdg.source,
											pos.alt.source,
											pos.spd.source,
										].includes('batch'),
										ts: date as unknown as Date,
									}
									return l
								})
								.filter((l) => l) as Location[],
					)
					.then(async (locations) => {
						if (!locations.length)
							return locations.map((location) => ({ location }))
						return timestreamQueryContext
							.query<{
								objectValuesDouble: number[]
								objectValuesVarchar: string[]
								objectKeys: string[]
								date: Date
							}>(
								(table) => `
								SELECT
								array_agg(measure_value::double) AS objectValuesDouble,
								array_agg(measure_value::varchar) AS objectValuesVarchar,
								array_agg(measure_name) AS objectKeys,
								time as date
								FROM ${table}
								WHERE deviceId='${cat.id}'
								AND substr(measure_name, 1, 5) = 'roam.'
								AND time <= '${timestreamQueryContext.formatDate(locations[0].ts)}'
								GROUP BY measureGroup, time
								ORDER BY time DESC
								`,
							)
							.then((result) => {
								const roaming = result.map(
									({
										objectValuesDouble,
										objectValuesVarchar,
										objectKeys,
										date,
									}) => {
										const roaming = objectKeys.reduce(
											(obj, k, i) => ({
												...obj,
												[k.split('.')[1]]:
													objectValuesDouble[i] ?? objectValuesVarchar[i],
											}),
											{} as {
												mccmnc: number
												rsrp: number
												cell: number
												area: number
												ip: string
											},
										)
										const l: Roaming = {
											roaming,
											ts: date as unknown as Date,
										}
										return l
									},
								)
								// Add roaming data to history
								return locations.map((location) => ({
									location,
									roaming: roaming.find(
										({ ts }) => ts.getTime() <= location.ts.getTime(),
									), // Find the first roaming entry that is older than the location
								}))
							})
					})
			}
		/>
	)
}
