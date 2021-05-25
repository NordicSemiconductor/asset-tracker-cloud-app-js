import React, { useState, useEffect } from 'react'
import { CatInfo } from '../aws/Cat/Cat'
import { Location, CellLocation, Map, CatMapContainer } from './Map'
import { Settings } from './Settings'

const LoadHistoricalMapData = ({
	cat,
	deviceLocation,
	cellLocation,
	fetchHistory,
	numEntries,
	fetchHistoricalData,
	onSettings,
}: {
	cat: CatInfo
	deviceLocation?: Location
	cellLocation?: CellLocation
	numEntries: number
	fetchHistoricalData: boolean
	fetchHistory: (numEntries: number) => Promise<{ location: Location }[]>
	onSettings: (args: { enabled: boolean; numEntries: number }) => void
}) => {
	const [history, setHistory] = useState<{ location: Location }[]>()

	useEffect(() => {
		let isCancelled = false

		if (!fetchHistoricalData) return

		window.setTimeout(() => {
			if (!isCancelled) {
				void fetchHistory(numEntries)
					.then((res) => {
						if (!isCancelled) {
							console.log('[Map]', 'history', res)
							setHistory(res)
						}
					})
					.catch(console.error)
			}
		}, 500)

		return () => {
			isCancelled = true
		}
	}, [fetchHistory, numEntries, fetchHistoricalData])

	const settings = (
		<Settings
			enabled={fetchHistoricalData}
			numEntries={numEntries}
			onSettings={onSettings}
		/>
	)

	const mapWithoutHistoricalData = (
		<Map
			deviceLocation={deviceLocation}
			cellLocation={cellLocation}
			label={cat.id}
		/>
	)

	if (history === undefined)
		return (
			<CatMapContainer>
				{mapWithoutHistoricalData}
				{settings}
			</CatMapContainer>
		)

	return (
		<CatMapContainer>
			<Map
				deviceLocation={deviceLocation}
				cellLocation={cellLocation}
				label={cat.id}
				history={history}
			/>
			{settings}
		</CatMapContainer>
	)
}

export const HistoricalDataMap = ({
	cat,
	deviceLocation,
	cellLocation,
	fetchHistory,
}: {
	cat: CatInfo
	deviceLocation?: Location
	cellLocation?: CellLocation
	fetchHistory: (numEntries: number) => Promise<
		{
			location: Location
		}[]
	>
}) => {
	let initialState = true

	if (
		window.localStorage.getItem(`asset-tracker:catmap:fetchPastPositions`) ===
		'0'
	) {
		initialState = false
	}
	const [fetchHistoricalData, setFetchHistoricalData] = useState(initialState)

	const storedNumPastPostions = window.localStorage.getItem(
		'asset-tracker:catmap:numEntries',
	)
	const [numEntries, setNumEntries] = useState(
		storedNumPastPostions !== null ? parseInt(storedNumPastPostions, 10) : 10,
	)

	return (
		<LoadHistoricalMapData
			cat={cat}
			deviceLocation={deviceLocation}
			cellLocation={cellLocation}
			fetchHistory={fetchHistory}
			numEntries={numEntries}
			fetchHistoricalData={fetchHistoricalData}
			onSettings={({ enabled, numEntries }) => {
				setNumEntries(numEntries)
				setFetchHistoricalData(enabled)
				window.localStorage.setItem(
					`asset-tracker:catmap:fetchPastPositions`,
					enabled ? '1' : '0',
				)
				window.localStorage.setItem(
					'asset-tracker:catmap:numEntries',
					`${numEntries}`,
				)
			}}
		/>
	)
}
