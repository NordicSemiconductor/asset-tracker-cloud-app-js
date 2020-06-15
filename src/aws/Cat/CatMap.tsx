import { HistoricalDataLoader } from '../HistoricalData/HistoricalDataLoader'
import {
	Map,
	Location,
	CellLocation,
	SettingsFormGroup,
	CatMapContainer,
} from '../../Map/Map'
import React, { useState, useEffect } from 'react'
import { Label, Input } from 'reactstrap'
import { ThingState } from '../../@types/aws-device'
import { AthenaContext } from '../App'
import { geolocateCell } from '../geolocateCell'
import { isRight } from 'fp-ts/lib/Either'
import { CatInfo } from './Cat'

export const CatMap = ({
	athenaContext,
	cat,
	state,
	geolocationApiEndpoint,
}: {
	athenaContext: AthenaContext
	cat: CatInfo
	state: ThingState
	geolocationApiEndpoint: string
}) => {
	let initialState = true

	if (
		window.localStorage.getItem(`bifravst:catmap:fetchPastPositions`) === '0'
	) {
		initialState = false
	}
	const [fetchHistoricalData, setFetchHistoricalData] = useState(initialState)

	const storedNumPastPostions = window.localStorage.getItem(
		'bifravst:catmap:numPastPositions',
	)
	const [numPastPositions, updateNumPastPositions] = useState(
		storedNumPastPostions !== null ? parseInt(storedNumPastPostions, 10) : 10,
	)
	const [cellLocation, setCellLocation] = useState<CellLocation>()

	const { reported } = state

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

	const toggle = () => {
		const state = !fetchHistoricalData
		setFetchHistoricalData(state)
		window.localStorage.setItem(
			`bifravst:catmap:fetchPastPositions`,
			state ? '1' : '0',
		)
	}

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

	const mapWithoutHistoricalData = (
		<Map
			deviceLocation={deviceLocation}
			cellLocation={cellLocation}
			accuracy={reported.gps?.v.acc}
			heading={reported.gps?.v.hdg}
			label={cat.id}
		/>
	)

	const settings = (
		<SettingsFormGroup check>
			<Label check>
				<Input
					type="checkbox"
					name="fetchHistoricalData"
					onChange={toggle}
					checked={fetchHistoricalData}
				/>{' '}
				Fetch history?
			</Label>
			{fetchHistoricalData && (
				<Input
					bsSize={'sm'}
					type="number"
					name="numPastPositions"
					onChange={({ target: { value } }) => {
						const v = parseInt(value, 10)
						if (!isNaN(v)) {
							updateNumPastPositions(v)
							window.localStorage.setItem(
								'bifravst:catmap:numPastPositions',
								`${v}`,
							)
						}
					}}
					value={numPastPositions}
				/>
			)}
		</SettingsFormGroup>
	)

	if (!fetchHistoricalData) {
		return (
			<CatMapContainer>
				{mapWithoutHistoricalData}
				{settings}
			</CatMapContainer>
		)
	}

	return (
		<CatMapContainer>
			<HistoricalDataLoader
				athenaContext={athenaContext}
				deviceId={cat.id}
				formatFields={{
					lat: parseFloat,
					lng: parseFloat,
					date: (v) => new Date(v),
				}}
				QueryString={`SELECT reported.gps.ts as date, reported.gps.v.lat as lat, reported.gps.v.lng as lng FROM ${athenaContext.dataBase}.${athenaContext.rawDataTable} WHERE deviceId='${cat.id}' AND reported.gps IS NOT NULL AND reported.gps.v.lat IS NOT NULL AND reported.gps.v.lng IS NOT NULL ORDER BY reported.gps.ts DESC LIMIT ${numPastPositions}`}
				loading={mapWithoutHistoricalData}
			>
				{({ data }) => (
					<Map
						deviceLocation={deviceLocation}
						cellLocation={cellLocation}
						accuracy={reported.gps?.v.acc}
						heading={reported.gps?.v.hdg}
						label={cat.id}
						history={((data as unknown) as {
							date: string
							lat: number
							lng: number
						}[]).map(({ date, lat, lng }) => ({
							ts: new Date(date),
							position: {
								lat,
								lng,
							},
						}))}
					/>
				)}
			</HistoricalDataLoader>
			{settings}
		</CatMapContainer>
	)
}
