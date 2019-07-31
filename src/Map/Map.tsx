import React, { createRef } from 'react'
import { Map as LeafletMap, TileLayer, Marker, Popup, Circle } from 'react-leaflet'

import './Map.scss'

export const Map = ({
	position: { lat, lng },
	accuracy,
	label,
}: {
	position: { lat: number; lng: number }
	accuracy: number
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
			<Circle center={[lat, lng]} radius={accuracy}/>
		</LeafletMap>
	)
}
