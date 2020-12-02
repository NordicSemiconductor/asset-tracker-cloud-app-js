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

const MapContainerContainer = styled.div`
	> .leaflet-container {
		height: 300px;
	}
`

export const CatMapContainer = styled.div`
	position: relative;
`

export const SettingsFormGroup = styled(FormGroup)`
	position: absolute;
	padding: 0.5rem 0.5rem 0.5rem 2rem;
	background-color: #ffffffaf;
	top: 0;
	right: 0;
	z-index: 999;
	display: flex;
	align-items: center;
	@media (min-width: ${mobileBreakpoint}) {
		top: auto;
		right: auto;
		bottom: 0;
		z-index: 10000;
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
	ts: Date
}

export type CellLocation = {
	position: Position & { accuracy: number }
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

export const Map = ({
	deviceLocation,
	cellLocation,
	label,
	history,
}: {
	deviceLocation?: Location
	cellLocation?: CellLocation
	label: string
	history?: Location[]
}) => {
	let zoom = 13
	const userZoom = window.localStorage.getItem('bifravst:zoom')
	if (userZoom !== null) {
		zoom = parseInt(userZoom, 10)
	}
	const [mapZoom, setMapZoom] = useState(zoom)

	if (!cellLocation && !deviceLocation) return <NoMap />

	// Hide the cell location circle if the GPS location exists and is not older than 5 minutes
	const cellLocationIsMoreUpToDate =
		cellLocation &&
		((deviceLocation &&
			cellLocation.ts.getTime() - 10 * 60 * 1000 >
				deviceLocation.ts.getTime()) ||
			!deviceLocation)

	let center: Location = cellLocation ?? (deviceLocation as Location)
	if (
		(cellLocation !== undefined &&
			deviceLocation !== undefined &&
			deviceLocation.ts.getTime() > cellLocation.ts.getTime()) ||
		(deviceLocation !== undefined &&
			cellLocationIsMoreUpToDate !== undefined &&
			!cellLocationIsMoreUpToDate)
	) {
		center = deviceLocation
	}

	return (
		<MapContainerContainer>
			<MapContainer
				center={[center.position.lat, center.position.lng]}
				zoom={zoom}
			>
				<EventHandler
					onZoomEnd={({ map }) => {
						window.localStorage.setItem('bifravst:zoom', `${map.getZoom()}`)
						setMapZoom(map.getZoom())
					}}
				/>
				<TileLayer
					attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={center.position}>
					<Popup>{label}</Popup>
				</Marker>
				{deviceLocation?.position.accuracy !== undefined &&
					cellLocationIsMoreUpToDate !== undefined &&
					!cellLocationIsMoreUpToDate && (
						<Circle
							center={deviceLocation.position}
							radius={deviceLocation.position.accuracy}
						/>
					)}
				{cellLocation && cellLocationIsMoreUpToDate && (
					<Circle
						center={cellLocation.position}
						radius={cellLocation.position.accuracy}
						color={'#F6C270'}
					/>
				)}
				{deviceLocation?.position.heading !== undefined && (
					<HeadingMarker
						position={deviceLocation.position}
						heading={deviceLocation.position.heading}
						mapZoom={mapZoom}
					/>
				)}
				{deviceLocation &&
					history?.map(
						({ position: { lat, lng, accuracy, heading, speed }, ts }, k) => {
							const alpha = Math.round((1 - k / history.length) * 255).toString(
								16,
							)
							const color = `#1f56d2${alpha}`
							return (
								<React.Fragment key={`history-${k}`}>
									<Circle center={{ lat, lng }} radius={1} color={color} />
									{k > 0 && (
										<Polyline
											positions={[history[k - 1].position, { lat, lng }]}
											weight={mapZoom > 16 ? 1 : 2}
											lineCap={'round'}
											color={color}
											dashArray={'10'}
										/>
									)}
									{heading !== undefined && (
										<HeadingMarker
											position={{ lat, lng }}
											heading={heading}
											mapZoom={mapZoom}
											color={'#00000080'}
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
												<dt>Time</dt>
												<dd>
													<time dateTime={new Date(ts).toISOString()}>
														{formatDistanceToNow(ts, {
															includeSeconds: true,
															addSuffix: true,
														})}
													</time>
												</dd>
												<dt>Accuracy</dt>
												<dd>{accuracy} m</dd>
												<dt>Speed</dt>
												<dd>{speed} m/s</dd>
												<dt>Heading</dt>
												<dd>{heading}°</dd>
											</HistoryInfo>
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
