import React, { useEffect, useState } from 'react'
import { IotConsumer } from '../App'
import { Iot, IotData } from 'aws-sdk'
import { Map, CatLocation } from '../../CatsMap/Map'

const CatsMapLoader = ({ iot, iotData }: { iot: Iot; iotData: IotData }) => {
	const [cats, setCats] = useState([] as CatLocation[])

	useEffect(() => {
		let isCancelled = false
		iot
			.listThings()
			.promise()
			.then(async ({ things }) =>
				Promise.all(
					(things ?? []).map(async ({ thingName, attributes }) =>
						iotData
							.getThingShadow({ thingName: `${thingName}` })
							.promise()
							.then(({ payload }) => {
								if (payload === undefined) {
									return
								}
								const p = JSON.parse(payload.toString())
								const { lat, lng } = p.state.reported.gps.v
								if (lat !== undefined && lng !== undefined) {
									return {
										id: thingName as string,
										name: attributes?.name ?? (thingName as string),
										lat,
										lng,
									}
								}
							})
							.catch((err) => {
								console.error(err)
							}),
					),
				),
			)
			.then(async (points: (CatLocation | void)[]) => {
				if (!isCancelled) setCats(points.filter((p) => p) as CatLocation[])
			})
			.catch(console.error)
		return () => {
			isCancelled = true
		}
	}, [iot, iotData])
	return <Map cats={cats} />
}

export const CatsMap = () => (
	<IotConsumer>
		{({ iot, iotData }) => <CatsMapLoader iot={iot} iotData={iotData} />}
	</IotConsumer>
)
