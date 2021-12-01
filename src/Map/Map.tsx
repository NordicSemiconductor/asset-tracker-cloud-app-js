import React, { useState } from 'react'
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	Circle,
	Polyline,
	MapConsumer,
	useMapEvents,
} from 'react-leaflet'
import { LeafletEvent, Map as LeafletMap } from 'leaflet'
import { NoMap } from './NoMap'
import styled from 'styled-components'
import { mobileBreakpoint } from '../Styles'
import { FormGroup } from 'reactstrap'
import { formatDistanceToNow } from 'date-fns'
import { SignalQuality } from '../ConnectionInformation/ConnectionInformation'
import { nullOrUndefined } from '../util/nullOrUndefined'
import { centerOnLatestLocation } from './centerOnLatestLocation'
import { MapSettingsType } from './Settings'

const MapContainerContainer = styled.div`
	> .leaflet-container {
		height: 300px;
	}
`

export const CatMapContainer = styled.div`
	position: relative;
`

export const SettingsFormGroup = styled(FormGroup)`
	position: relative;
	padding: 0.5rem 0.5rem 0.5rem 0.5rem;
	background-color: #f7f7f7;
	top: 0;
	right: 0;
	z-index: 999;
	display: flex;
	flex-wrap: wrap;
	border-bottom: 1px solid #dcdcdc;
	@media (min-width: ${mobileBreakpoint}) {
		top: auto;
		right: auto;
		bottom: 0;
		z-index: 10000;
		border-bottom: 1px solid #dcdcdc;
	}
	input[type='number'] {
		width: 70px;
		margin-left: 0.5rem;
	}
`

const HistoryInfo = styled.dl`
	display: grid;
	grid-template: auto / 1fr 2fr;
	dt,
	dd {
		padding: 0;
		margin: 0;
		border-bottom: 1px solid #f0f0f0;
	}
	dt {
		padding-right: 1rem;
	}
	dt {
		flex-grow: 1;
	}
`

type Position = { lat: number; lng: number }

export type Location = {
	position: Position & {
		accuracy?: number
		heading?: number
		altitude?: number
		speed?: number
	}
	batch?: boolean
	ts: Date
}

export type CellLocation = {
	position: Position & { accuracy: number }
	ts: Date
}

export type Roaming = {
	roaming: {
		mccmnc: number
		rsrp: number
		cell: number
		area: number
		ip: string
	}
	ts: Date
}

const EventHandler = ({
	onZoomEnd,
}: {
	onZoomEnd: (args: { event: LeafletEvent; map: LeafletMap }) => void
}) => {
	const map = useMapEvents({
		zoomend: (event) => onZoomEnd({ event, map }),
	})
	return null
}

const HeadingMarker = ({
	heading,
	position,
	mapZoom,
	color,
}: {
	position: Position
	heading: number
	mapZoom: number
	color?: string
}) => (
	<MapConsumer key={mapZoom}>
		{(map) => {
			const { x, y } = map.project(position, mapZoom)
			const endpoint = map.unproject(
				[
					x + mapZoom * 3 * Math.cos((((heading - 90) % 360) * Math.PI) / 180),
					y + mapZoom * 3 * Math.sin((((heading - 90) % 360) * Math.PI) / 180),
				],
				mapZoom,
			)
			return (
				<Polyline
					positions={[position, endpoint]}
					weight={mapZoom > 16 ? 1 : 2}
					lineCap={'round'}
					color={color ?? '#000000'}
				/>
			)
		}}
	</MapConsumer>
)

const toFixed = (n: number): string => n.toFixed(2).replace(/(\.00)|(0)$/, '')

export const Map = ({
	deviceLocation,
	cellLocation,
	neighboringCellGeoLocation,
	label,
	history,
	enabledLayers,
	follow,
}: {
	deviceLocation?: Location
	cellLocation?: CellLocation
	neighboringCellGeoLocation?: CellLocation
	label: string
	history?: {
		location: Location
		roaming?: Roaming
	}[]
	enabledLayers: MapSettingsType['enabledLayers']
	follow: boolean
}) => {
	let zoom = 13
	const userZoom = window.localStorage.getItem('asset-tracker:zoom')
	if (userZoom !== null) {
		zoom = parseInt(userZoom, 10)
	}
	const [mapZoom, setMapZoom] = useState(zoom)
	const [map, setmap] = useState<LeafletMap>()

	if (
		[
			deviceLocation,
			cellLocation,
			neighboringCellGeoLocation,
			...(history ?? []),
		].filter((l) => l !== undefined).length === 0
	)
		return <NoMap /> // No location data at all to display

	const center = centerOnLatestLocation([
		deviceLocation,
		cellLocation,
		neighboringCellGeoLocation,
		...(history?.map(({ location }) => ({
			position: location.position,
			ts: location.ts,
		})) ?? []),
	])

	if (follow && map) {
		map.flyTo(center, zoom)
	}

	return (
		<MapContainerContainer>
			<MapContainer
				center={[center.lat, center.lng]}
				zoom={zoom}
				whenCreated={setmap}
			>
				<EventHandler
					onZoomEnd={({ map }) => {
						window.localStorage.setItem(
							'asset-tracker:zoom',
							`${map.getZoom()}`,
						)
						setMapZoom(map.getZoom())
					}}
				/>
				<TileLayer
					attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={center}>
					<Popup>{label}</Popup>
				</Marker>
				{deviceLocation?.position.accuracy !== undefined && (
					<Circle
						center={deviceLocation.position}
						radius={deviceLocation.position.accuracy}
					/>
				)}
				{cellLocation && enabledLayers.SinglecellLocations && (
					<Circle
						center={cellLocation.position}
						radius={cellLocation.position.accuracy}
						color={'#F6C270'}
					/>
				)}
				{neighboringCellGeoLocation && enabledLayers.MulticellLocations && (
					<Circle
						center={neighboringCellGeoLocation.position}
						radius={neighboringCellGeoLocation.position.accuracy}
						color={'#E56399'}
					/>
				)}
				{deviceLocation?.position.heading !== undefined &&
					enabledLayers.Headings && (
						<HeadingMarker
							position={deviceLocation.position}
							heading={deviceLocation.position.heading}
							mapZoom={mapZoom}
						/>
					)}
				{(history?.length ?? 0) > 0 &&
					history?.map(
						(
							{
								location: {
									position: { lat, lng, accuracy, heading, speed },
									batch,
									ts,
								},
								roaming,
							},
							k,
						) => {
							const alpha = Math.round((1 - k / history.length) * 255).toString(
								16,
							)
							const color = `#1f56d2${alpha}`

							return (
								<React.Fragment key={`history-${k}`}>
									<Circle center={{ lat, lng }} radius={1} color={color} />
									{k > 0 && (
										<Polyline
											positions={[
												history[k - 1].location.position,
												{ lat, lng },
											]}
											weight={mapZoom > 16 ? 1 : 2}
											lineCap={'round'}
											color={color}
											dashArray={'10'}
										/>
									)}
									{heading !== undefined && enabledLayers.Headings && (
										<HeadingMarker
											position={{ lat, lng }}
											heading={heading}
											mapZoom={mapZoom}
											color={'#00000080'}
										/>
									)}
									{batch && (
										<Circle
											center={{ lat, lng }}
											radius={20}
											stroke={true}
											color={'#ff0000'}
											weight={2}
											fill={false}
											dashArray={mapZoom > 16 ? '3 6' : '6 12'}
										/>
									)}
									<Circle
										center={{ lat, lng }}
										radius={16}
										fillColor={'#826717'}
										stroke={false}
									>
										<Popup position={{ lat, lng }}>
											<HistoryInfo>
												{!nullOrUndefined(accuracy) && (
													<>
														<dt>Accuracy</dt>
														<dd>{toFixed(accuracy as number)} m</dd>
													</>
												)}
												{!nullOrUndefined(speed) && (
													<>
														<dt>Speed</dt>
														<dd>{toFixed(speed as number)} m/s</dd>
													</>
												)}
												{!nullOrUndefined(heading) && (
													<>
														<dt>Heading</dt>
														<dd>{toFixed(heading as number)}°</dd>
													</>
												)}
												<dt>Time</dt>
												<dd>
													<time dateTime={new Date(ts).toISOString()}>
														{formatDistanceToNow(ts, {
															includeSeconds: true,
															addSuffix: true,
														})}
													</time>
												</dd>
												{batch && (
													<>
														<dt>Batch</dt>
														<dd>Yes</dd>
													</>
												)}
											</HistoryInfo>
											{roaming !== undefined && !batch && (
												<>
													<HistoryInfo>
														<dt>Connection</dt>
														<dd style={{ textAlign: 'right' }}>
															<SignalQuality dbm={roaming.roaming.rsrp} />
														</dd>
														<dt>MCC/MNC</dt>
														<dd>{roaming.roaming.mccmnc}</dd>
														<dt>Area Code</dt>
														<dd>{roaming.roaming.area}</dd>
														<dt>Cell ID</dt>
														<dd>{roaming.roaming.cell}</dd>
														<dt>IP</dt>
														<dd>{roaming.roaming.ip}</dd>
														<dt>RSRP</dt>
														<dd>{roaming.roaming.rsrp}</dd>
														<dt>Time</dt>
														<dd>
															<time
																dateTime={new Date(roaming.ts).toISOString()}
															>
																{formatDistanceToNow(roaming.ts, {
																	includeSeconds: true,
																	addSuffix: true,
																})}
															</time>
														</dd>
													</HistoryInfo>
												</>
											)}
										</Popup>
									</Circle>
								</React.Fragment>
							)
						},
					)}
			</MapContainer>
		</MapContainerContainer>
	)
}
