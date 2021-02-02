import { LeafletEvent, Map as LeafletMap } from 'leaflet'
import React from 'react'
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMapEvents,
} from 'react-leaflet'

export type CatLocation = {
	lat: number
	lng: number
	id: string
	name: string
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

export const Map = ({ cats }: { cats: CatLocation[] }) => {
	let zoom = 3
	const userZoom = window.localStorage.getItem('asset-tracker:zoom')
	if (userZoom !== null) {
		zoom = parseInt(userZoom, 10)
	}
	return (
		<MapContainer center={[63.4212859, 10.4370703]} zoom={zoom}>
			<EventHandler
				onZoomEnd={({ map }) => {
					window.localStorage.setItem('asset-tracker:zoom', `${map.getZoom()}`)
				}}
			/>
			<TileLayer
				attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{cats.map(({ lat, lng, id, name }) => (
				<Marker key={id} position={[lat, lng]}>
					<Popup>{name}</Popup>
				</Marker>
			))}
		</MapContainer>
	)
}
