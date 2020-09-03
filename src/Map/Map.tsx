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
import { mobileBreakpoint } from '../Styles'
import { FormGroup } from 'reactstrap'

const LeafletMapContainer = styled.div`
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

type Position = { lat: number; lng: number }

export type Location = {
	position: Position & { accuracy?: number; heading?: number }
	ts: Date
}

export type CellLocation = {
	position: Position & { accuracy: number }
	ts: Date
}

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
}): React.ReactElement => {
	let zoom = 13
	const userZoom = window.localStorage.getItem('bifravst:zoom')
	if (userZoom !== null) {
		zoom = parseInt(userZoom, 10)
	}
	const [mapZoom, setMapZoom] = useState(zoom)
	const mapRef = createRef<LeafletMap>()

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
		<LeafletMapContainer>
			<LeafletMap
				viewport={{
					center: [center.position.lat, center.position.lng],
					zoom,
				}}
				ref={mapRef}
				onzoomend={() => {
					window.localStorage.setItem(
						'bifravst:zoom',
						`${mapRef.current?.viewport?.zoom ?? 13}`,
					)
					setMapZoom(mapRef.current?.viewport?.zoom ?? 13)
				}}
			>
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
					<LeafletConsumer key={mapZoom}>
						{({ map }) => {
							if (map) {
								const { x, y } = map.project(deviceLocation.position, mapZoom)
								const endpoint = map.unproject(
									[
										x +
											mapZoom *
												3 *
												Math.cos(
													((((deviceLocation?.position.heading ?? 0) - 90) %
														360) *
														Math.PI) /
														180,
												),
										y +
											mapZoom *
												3 *
												Math.sin(
													((((deviceLocation?.position.heading ?? 0) - 90) %
														360) *
														Math.PI) /
														180,
												),
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
					history?.map(({ position: { lat, lng } }, k) => {
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
										linecap={'round'}
										color={color}
										dashArray={'10'}
									/>
								)}
							</React.Fragment>
						)
					})}
			</LeafletMap>
		</LeafletMapContainer>
	)
}
