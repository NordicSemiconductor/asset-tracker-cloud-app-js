import React, { createRef } from 'react'
import {
	Map as LeafletMap,
	TileLayer,
	Marker,
	Popup,
	Circle,
	Polyline,
	LeafletConsumer,
} from 'react-leaflet'

import './Map.scss'

export const Map = ({
	position: { lat, lng },
	accuracy,
	heading,
	label,
}: {
	position: { lat: number; lng: number }
	accuracy?: number
	heading?: number
	label: string
}) => {
	let zoom = 13
	const userZoom = window.localStorage.getItem('bifravst:zoom')
	if (userZoom) {
		zoom = parseInt(userZoom, 10)
	}
	const mapRef = createRef<LeafletMap>()
	return (
		<LeafletMap
			center={[lat, lng]}
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
				}
			}}
		>
			<TileLayer
				attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<Marker position={[lat, lng]}>
				<Popup>{label}</Popup>
			</Marker>
			{accuracy && <Circle center={[lat, lng]} radius={accuracy} />}
			{heading && (
				<LeafletConsumer>
					{({ map }) => {
						if (map) {
							const { x, y } = map.project([lat, lng], zoom)
							const endpoint = map.unproject(
								[
									x + 30 * Math.cos((((heading - 90) % 360) * Math.PI) / 180),
									y + 30 * Math.sin((((heading - 90) % 360) * Math.PI) / 180),
								],
								zoom,
							)
							return (
								<Polyline
									positions={[[lat, lng], endpoint]}
									color={'#000000'}
								/>
							)
						}
					}}
				</LeafletConsumer>
			)}
		</LeafletMap>
	)
}
