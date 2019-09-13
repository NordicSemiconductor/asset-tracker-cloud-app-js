import React, { createRef, useEffect, useState } from 'react'
import { IotConsumer } from '../App'
import { Iot, IotData } from 'aws-sdk'
import { Map as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet'

type CatLocation = {
	lat: number
	lng: number
	id: string
	name: string
}

const Map = ({ iot, iotData }: { iot: Iot; iotData: IotData }) => {
	const [cats, setCats] = useState([] as CatLocation[])
	let zoom = 3
	const userZoom = window.localStorage.getItem('bifravst:zoom')
	if (userZoom) {
		zoom = parseInt(userZoom, 10)
	}
	const mapRef = createRef<LeafletMap>()
	useEffect(() => {
		iot
			.listThings()
			.promise()
			.then(async ({ things }) =>
				Promise.all(
					(things || []).map(async ({ thingName, attributes }) =>
						iotData
							.getThingShadow({ thingName: `${thingName}` })
							.promise()
							.then(({ payload }) => {
								if (!payload) {
									return
								}
								const p = JSON.parse(payload.toString())
								const { lat, lng } = p.state.reported.gps.v
								if (lat && lng) {
									return {
										id: thingName as string,
										name:
											(attributes && attributes.name) || (thingName as string),
										lat,
										lng,
									}
								}
							})
							.catch(() => {}),
					),
				),
			)
			.then(async (points: (CatLocation | void)[]) => {
				setCats(points.filter(p => p) as CatLocation[])
			})
			.catch(err => {
				console.error(err)
			})
	}, [iot, iotData])
	return (
		<LeafletMap
			center={[63.4212859, 10.4370703]}
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
			{cats.map(({ lat, lng, id, name }) => (
				<Marker key={id} position={[lat, lng]}>
					<Popup>{name}</Popup>
				</Marker>
			))}
		</LeafletMap>
	)
}

export const CatsMap = () => (
	<IotConsumer>
		{({ iot, iotData }) => <Map iot={iot} iotData={iotData} />}
	</IotConsumer>
)
