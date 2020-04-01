import { HistoricalDataLoader } from '../../HistoricalData/HistoricalDataLoader'
import { Map, Location, CellLocation } from '../../Map/Map'
import React, { useState, useEffect } from 'react'
import { AWSIotThingState } from '../connectAndListenForStateChange'
import { FormGroup, Label, Input } from 'reactstrap'
import styled from 'styled-components'
import { mobileBreakpoint } from '../../Styles'
import { RoamingInformation } from '../../@types/DeviceShadow'
import { AthenaContext } from '../App'
import { geolocateCell } from '../geolocateCell'
import { isRight } from 'fp-ts/lib/Either'
import { CatInfo } from './Cat'

const SettingsFormGroup = styled(FormGroup)`
	position: absolute;
	padding: 0.5rem 0.5rem 0.5rem 2rem;
	background-color: #ffffffaf;
	top: 0;
	right: 0;
	z-index: 999;
	@media (min-width: ${mobileBreakpoint}) {
		top: auto;
		right: auto;
		bottom: 0;
		z-index: 10000;
	}
`

const CatMapContainer = styled.div`
	position: relative;
`

export const CatMap = ({
	athenaContext,
	cat,
	state,
	geolocationApiEndpoint,
}: {
	athenaContext: AthenaContext
	cat: CatInfo
	state: AWSIotThingState
	geolocationApiEndpoint: string
}) => {
	let initialState = true

	if (
		window.localStorage.getItem(`bifravst:catmap:fetchPastPositions`) === '0'
	) {
		initialState = false
	}
	const [fetchHistoricalData, setFetchHistoricalData] = useState(initialState)
	const [cellLocation, setCellLocation] = useState<CellLocation>()

	const { reported } = state

	useEffect(() => {
		let isCancelled = false
		if (reported && reported.roam) {
			geolocateCell(geolocationApiEndpoint)({
				area: reported.roam.v.area.value,
				cell: reported.roam.v.cell.value,
				mccmnc: reported.roam.v.mccmnc.value,
			})
				.then(geolocation => {
					if (isCancelled) return
					if (isRight(geolocation)) {
						const l: CellLocation = {
							ts: new Date((reported.roam as RoamingInformation).ts.value),
							position: geolocation.right,
						}
						setCellLocation(l)
					}
				})
				.catch(err => {
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

	const gps = reported && reported.gps

	let deviceLocation: Location | undefined = undefined

	if (gps !== undefined) {
		deviceLocation = {
			ts: new Date(gps.ts.value),
			position: {
				lat: gps.v.lat.value,
				lng: gps.v.lng.value,
			},
		}
	}

	const mapWithoutHistoricalData = (
		<Map
			deviceLocation={deviceLocation}
			cellLocation={cellLocation}
			accuracy={gps && gps.v.acc && gps.v.acc.value}
			heading={gps && gps.v.hdg && gps.v.hdg.value}
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
					date: v => new Date(v),
				}}
				QueryString={`SELECT reported.gps.ts as date, reported.gps.v.lat as lat, reported.gps.v.lng as lng FROM ${athenaContext.dataBase}.${athenaContext.rawDataTable} WHERE deviceId='${cat.id}' AND reported.gps IS NOT NULL AND reported.gps.v.lat IS NOT NULL AND reported.gps.v.lng IS NOT NULL ORDER BY reported.gps.ts DESC LIMIT 10`}
				loading={mapWithoutHistoricalData}
			>
				{({ data }) => (
					<Map
						deviceLocation={deviceLocation}
						cellLocation={cellLocation}
						accuracy={gps && gps.v.acc && gps.v.acc.value}
						heading={gps && gps.v.hdg && gps.v.hdg.value}
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
