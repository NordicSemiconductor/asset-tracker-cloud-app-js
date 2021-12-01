import React, { useState, useEffect } from 'react'
import { CatInfo } from '../aws/Cat/Cat'
import { CollapsedContextConsumer } from '../Collapsable/CollapsedContext'
import { Location, CellLocation, Map, CatMapContainer } from './Map'
import { MapSettings } from './Settings'
import { MapSettingsType } from './Settings'
import { ShowSettingsButton } from './ShowSettingsButton'

const LoadHistoricalMapData = ({
	cat,
	deviceLocation,
	neighboringCellGeoLocation,
	cellLocation,
	fetchHistory,
	numEntries,
	follow,
	visibleMapLayers,
	fetchHistoricalData,
	onSettings,
}: {
	cat: CatInfo
	deviceLocation?: Location
	cellLocation?: CellLocation
	neighboringCellGeoLocation?: CellLocation
	numEntries: number
	visibleMapLayers: MapSettingsType['enabledLayers']
	fetchHistoricalData: boolean
	follow: boolean
	fetchHistory: (numEntries: number) => Promise<{ location: Location }[]>
	onSettings: (args: MapSettingsType) => void
}) => {
	const [history, setHistory] = useState<{ location: Location }[]>()
	const [showSettings, setShowSettings] = useState(false)

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

	const settings = showSettings ? (
		<MapSettings
			initial={{
				numEntries,
				enabledLayers: visibleMapLayers,
				follow,
			}}
			onSettings={(newSettings) => {
				onSettings(newSettings)
				if (newSettings.enabledLayers.FetchHistory === false) setHistory([])
			}}
		/>
	) : null

	const map =
		history === undefined ? (
			<Map
				deviceLocation={deviceLocation}
				cellLocation={cellLocation}
				neighboringCellGeoLocation={neighboringCellGeoLocation}
				label={cat.id}
				enabledLayers={visibleMapLayers}
				follow={follow}
			/>
		) : (
			<Map
				deviceLocation={deviceLocation}
				cellLocation={cellLocation}
				neighboringCellGeoLocation={neighboringCellGeoLocation}
				label={cat.id}
				history={history}
				enabledLayers={visibleMapLayers}
				follow={follow}
			/>
		)

	return (
		<CollapsedContextConsumer>
			{({ setVisible: setMobileAvatarVisble }) => (
				<>
					<CatMapContainer>
						{map}
						<ShowSettingsButton
							initial={false}
							onToggle={(visible) => {
								setShowSettings(visible)
								setMobileAvatarVisble(!visible)
							}}
						/>
					</CatMapContainer>
					{settings}
				</>
			)}
		</CollapsedContextConsumer>
	)
}

export const HistoricalDataMap = ({
	cat,
	deviceLocation,
	cellLocation,
	neighboringCellGeoLocation,
	fetchHistory,
}: {
	cat: CatInfo
	deviceLocation?: Location
	neighboringCellGeoLocation?: CellLocation
	cellLocation?: CellLocation
	fetchHistory: (numEntries: number) => Promise<
		{
			location: Location
		}[]
	>
}) => {
	// By default, fetch historical positions
	let fetchPastPositions = true
	if (
		window.localStorage.getItem(`asset-tracker:catmap:fetchPastPositions`) ===
		'0'
	) {
		// override from user setting in local storage
		fetchPastPositions = false
	}
	const [fetchHistoricalData, setFetchHistoricalData] =
		useState(fetchPastPositions)

	// How many historical positions to fetch, defaults to 10
	const storedNumPastPostions = window.localStorage.getItem(
		'asset-tracker:catmap:numEntries',
	)
	const [numEntries, setNumEntries] = useState(
		storedNumPastPostions !== null ? parseInt(storedNumPastPostions, 10) : 10,
	)

	// Which map layers to show
	let visibleMapLayerDefaultState = {
		FetchHistory: true,
		Headings: true,
		MulticellLocations: true,
		SinglecellLocations: true,
	}
	const userVisibleMapLayerDefaultState = window.localStorage.getItem(
		`asset-tracker:catmap:visibleMapLayers`,
	)
	if (userVisibleMapLayerDefaultState !== null) {
		try {
			visibleMapLayerDefaultState = JSON.parse(userVisibleMapLayerDefaultState)
		} catch {
			// pass
		}
	}
	const [visibleMapLayers, setVisibleMapLayers] = useState<
		MapSettingsType['enabledLayers']
	>(visibleMapLayerDefaultState)

	// By default, follow position changes
	let followPosition = true
	if (window.localStorage.getItem(`asset-tracker:catmap:follow`) === '0') {
		// override from user setting in local storage
		followPosition = false
	}
	const [follow, setFollow] = useState(followPosition)

	return (
		<LoadHistoricalMapData
			cat={cat}
			deviceLocation={deviceLocation}
			neighboringCellGeoLocation={neighboringCellGeoLocation}
			cellLocation={cellLocation}
			fetchHistory={fetchHistory}
			numEntries={numEntries}
			follow={follow}
			visibleMapLayers={visibleMapLayers}
			fetchHistoricalData={fetchHistoricalData}
			onSettings={({ enabledLayers, numEntries, follow }) => {
				setNumEntries(numEntries)
				window.localStorage.setItem(
					'asset-tracker:catmap:numEntries',
					`${numEntries}`,
				)

				setVisibleMapLayers(enabledLayers)
				window.localStorage.setItem(
					`asset-tracker:catmap:visibleMapLayers`,
					JSON.stringify(enabledLayers),
				)

				setFetchHistoricalData(enabledLayers.FetchHistory)
				window.localStorage.setItem(
					`asset-tracker:catmap:fetchPastPositions`,
					enabledLayers.FetchHistory ? '1' : '0',
				)

				setFollow(follow)
				console.log(`asset-tracker:catmap:follow`, follow ? '1' : '0')
				window.localStorage.setItem(
					`asset-tracker:catmap:follow`,
					follow ? '1' : '0',
				)
			}}
		/>
	)
}
