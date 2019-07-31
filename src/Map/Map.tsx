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
	const [mapZoom, setMapZoom] = useState(zoom)
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
					setMapZoom(mapRef.current.viewport.zoom)
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
				<LeafletConsumer key={mapZoom}>
					{({ map }) => {
						if (map) {
							const { x, y } = map.project([lat, lng], mapZoom)
							const endpoint = map.unproject(
								[
									x + (mapZoom * 3) * Math.cos((((heading - 90) % 360) * Math.PI) / 180),
									y + (mapZoom * 3) * Math.sin((((heading - 90) % 360) * Math.PI) / 180),
								],
								mapZoom,
							)
							console.log(mapZoom)
							return (
								<Polyline
									positions={[[lat, lng], endpoint]}
									weight={mapZoom > 16 ? 1 : 2}
									linecap={'round'}
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
