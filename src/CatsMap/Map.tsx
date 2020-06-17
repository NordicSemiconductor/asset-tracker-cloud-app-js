import React, { createRef } from 'react'
import { Map as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet'

export type CatLocation = {
	lat: number
	lng: number
	id: string
	name: string
}

export const Map = ({ cats }: { cats: CatLocation[] }) => {
	let zoom = 3
	const userZoom = window.localStorage.getItem('bifravst:zoom')
	if (userZoom !== null) {
		zoom = parseInt(userZoom, 10)
	}
	const mapRef = createRef<LeafletMap>()
	return (
		<LeafletMap
			center={[63.4212859, 10.4370703]}
			zoom={zoom}
			ref={mapRef}
			onzoomend={(e: Record<string, any>) => {
				if ((mapRef.current?.viewport?.zoom ?? 0) > 0) {
					window.localStorage.setItem(
						'bifravst:zoom',
						`${mapRef.current?.viewport?.zoom ?? 0}`,
					)
				}
			}}
		>
			<TileLayer
				attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{cats.map(({ lat, lng, id, name }) => (
				<Marker key={id} position={[lat, lng]}>
					<Popup>{name}</Popup>
				</Marker>
			))}
		</LeafletMap>
	)
}
