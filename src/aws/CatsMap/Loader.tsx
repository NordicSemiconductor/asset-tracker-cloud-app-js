import React, { useEffect, useState } from 'react'
import { IotConsumer } from '../App'
import { IoTClient, ListThingsCommand } from '@aws-sdk/client-iot'
import {
	IoTDataPlaneClient,
	GetThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { Map, CatLocation } from '../../CatsMap/Map'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'

const CatsMapLoader = ({
	iot,
	iotData,
}: {
	iot: IoTClient
	iotData: IoTDataPlaneClient
}) => {
	const [cats, setCats] = useState([] as CatLocation[])

	useEffect(() => {
		let isCancelled = false
		iot
			.send(new ListThingsCommand({}))
			.then(async ({ things }) =>
				Promise.all(
					(things ?? []).map(async ({ thingName, attributes }) =>
						iotData
							.send(new GetThingShadowCommand({ thingName: `${thingName}` }))
							.then(({ payload }) => {
								if (payload === undefined) {
									return
								}
								const p = JSON.parse(toUtf8(payload))
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
