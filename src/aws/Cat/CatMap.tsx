import { Location, CellLocation } from '../../Map/Map'
import React, { useState, useEffect } from 'react'
import { AthenaContext } from '../App'
import { geolocateCell } from '../geolocateCell'
import { isRight } from 'fp-ts/lib/Either'
import { CatInfo } from './Cat'
import { ThingState } from '../../@types/aws-device'
import { HistoricalDataMap } from '../../Map/HistoricalDataMap'
import { query, parseResult } from '@bifravst/athena-helpers'

export const CatMap = ({
	athenaContext,
	cat,
	state: { reported },
	geolocationApiEndpoint,
}: {
	athenaContext: AthenaContext
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
			fetchHistory={async (numEntries) => {
				const q = query({
					WorkGroup: athenaContext.workGroup,
					athena: athenaContext.athena,
				})
				return q({
					QueryString: `SELECT reported.gps.ts as date, reported.gps.v.lat as lat, reported.gps.v.lng as lng FROM ${athenaContext.dataBase}.${athenaContext.rawDataTable} WHERE deviceId='${cat.id}' AND reported.gps IS NOT NULL AND reported.gps.v.lat IS NOT NULL AND reported.gps.v.lng IS NOT NULL ORDER BY reported.gps.ts DESC LIMIT ${numEntries}`,
				}).then(async (ResultSet) => {
					const data = parseResult({
						ResultSet,
						formatFields: {
							lat: parseFloat,
							lng: parseFloat,
							date: (v) => new Date(v),
						},
						skip: 1,
					})
					return data.map(({ lat, lng, date }) => ({
						position: { lat: lat as number, lng: lng as number },
						ts: (date as unknown) as Date,
					}))
				})
			}}
		/>
	)
}
