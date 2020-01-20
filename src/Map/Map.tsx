import React, { createRef, useState } from 'react'
import {
	Map as LeafletMap,
	TileLayer,
	Marker,
	Popup,
	Circle,
	Polyline,
	LeafletConsumer,
} from 'react-leaflet'
import { NoMap } from './NoMap'
import styled from 'styled-components'

const StyledLeafletMap = styled(LeafletMap)`
	height: 300px;
`

type Position = { lat: number; lng: number }

export type Location = {
	position: Position
	ts: Date
}

export const Map = ({
	deviceLocation,
	cellLocation,
	accuracy,
	heading,
	label,
	history,
}: {
	deviceLocation?: Location
	cellLocation?: Location
	accuracy?: number
	heading?: number
	label: string
	history?: Location[]
}) => {
	let zoom = 13
	const userZoom = window.localStorage.getItem('bifravst:zoom')
	if (userZoom) {
		zoom = parseInt(userZoom, 10)
	}
	const [mapZoom, setMapZoom] = useState(zoom)
	const mapRef = createRef<LeafletMap>()

	if (!cellLocation && !deviceLocation) return <NoMap />

	// Hide the cell location circle if the GPS location exists and is not older than 5 minutes
	const cellLocationIsMoreUpToDate =
		cellLocation &&
		deviceLocation &&
		cellLocation.ts.getTime() - 10 * 60 * 1000 > deviceLocation.ts.getTime()

	let center: Location = cellLocation || (deviceLocation as Location)
	if (
		(cellLocation &&
			deviceLocation &&
			deviceLocation.ts.getTime() > cellLocation.ts.getTime()) ||
		(deviceLocation && !cellLocationIsMoreUpToDate)
	) {
		center = deviceLocation
	}

	return (
		<StyledLeafletMap
			center={center.position}
			zoom={zoom}
			ref={mapRef}
			onzoomend={(e: object) => {
				if (
					mapRef.current &&
					mapRef.current.viewport &&
					mapRef.current.viewport.zoom
				) {
					window.localStorage.setItem(
						'bifravst:zoom',
						`${mapRef.current.viewport.zoom}`,
					)
					setMapZoom(mapRef.current.viewport.zoom)
				}
			}}
		>
			<TileLayer
				attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<Marker position={center.position}>
				<Popup>{label}</Popup>
			</Marker>
			{deviceLocation && accuracy && (
				<Circle center={deviceLocation.position} radius={accuracy} />
			)}
			{cellLocation && cellLocationIsMoreUpToDate && (
				<Circle
					center={cellLocation.position}
					radius={2000}
					color={'#F6C270'}
				/>
			)}
			{deviceLocation && heading && (
				<LeafletConsumer key={mapZoom}>
					{({ map }) => {
						if (map) {
							const { x, y } = map.project(deviceLocation.position, mapZoom)
							const endpoint = map.unproject(
								[
									x +
										mapZoom *
											3 *
											Math.cos((((heading - 90) % 360) * Math.PI) / 180),
									y +
										mapZoom *
											3 *
											Math.sin((((heading - 90) % 360) * Math.PI) / 180),
								],
								mapZoom,
							)
							return (
								<Polyline
									positions={[deviceLocation.position, endpoint]}
									weight={mapZoom > 16 ? 1 : 2}
									linecap={'round'}
									color={'#000000'}
								/>
							)
						}
					}}
				</LeafletConsumer>
			)}
			{deviceLocation &&
				history &&
				history.map(({ position: { lat, lng } }, k) => {
					const alpha = Math.round((1 - k / history.length) * 255).toString(16)
					const color = `#1f56d2${alpha}`
					return (
						<React.Fragment key={`history-${k}`}>
							<Circle center={{ lat, lng }} radius={1} color={color} />
							{k > 0 && (
								<Polyline
									positions={[history[k - 1].position, { lat, lng }]}
									weight={mapZoom > 16 ? 1 : 2}
									linecap={'round'}
									color={color}
									dashArray={'10'}
								/>
							)}
						</React.Fragment>
					)
				})}
		</StyledLeafletMap>
	)
}
