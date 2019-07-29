import React from 'react'
import { Map as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet'

import './Map.scss'

export const Map = ({
	position: { lat, lng },
	label,
}: {
	position: { lat: number; lng: number }
	label: string
}) => (
	<LeafletMap center={[lat, lng]} zoom={13}>
		<TileLayer
			attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		/>
		<Marker position={[lat, lng]}>
			<Popup>{label}</Popup>
		</Marker>
	</LeafletMap>
)
