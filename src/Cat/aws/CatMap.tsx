import Athena from 'aws-sdk/clients/athena'
import { CatInfo } from './CatLoader'
import { Gps } from '../../@types/DeviceShadow'
import { HistoricalDataLoader } from '../../HistoricalData/HistoricalDataLoader'
import { Map } from '../../Map/Map'
import React from 'react'
import { AWSIotThingState } from '../../aws/connectAndListenForStateChange'
import { NoMap } from '../NoMap'

export const CatMap = ({
	athena,
	cat,
	athenaWorkGroup,
	athenaDataBase,
	athenaRawDataTable,
	state,
}: {
	athena: Athena
	cat: CatInfo
	athenaWorkGroup: string
	athenaDataBase: string
	athenaRawDataTable: string
	state: AWSIotThingState
}) => {
	const { reported } = state

	if (
		!reported ||
		!reported.gps ||
		!reported.gps.v ||
		!reported.gps.v.lat ||
		!reported.gps.v.lng
	)
		return <NoMap />

	const gps = reported.gps

	return (
		<HistoricalDataLoader
			athena={athena}
			deviceId={cat.id}
			formatFields={{
				lat: parseFloat,
				lng: parseFloat,
				date: v => new Date(v),
			}}
			QueryString={`SELECT reported.gps.ts as date, reported.gps.v.lat as lat, reported.gps.v.lng as lng FROM ${athenaDataBase}.${athenaRawDataTable} WHERE deviceId='${cat.id}' AND reported.gps IS NOT NULL AND reported.gps.v.lat IS NOT NULL AND reported.gps.v.lng IS NOT NULL ORDER BY reported.gps.ts DESC LIMIT 10`}
			workGroup={athenaWorkGroup}
			loading={
				<Map
					position={{
						lat: gps.v.lat.value,
						lng: gps.v.lng.value,
					}}
					accuracy={gps.v.acc && gps.v.acc.value}
					heading={gps.v.hdg && gps.v.hdg.value}
					label={cat.id}
				/>
			}
		>
			{({ data }) => (
				<Map
					position={{
						lat: gps.v.lat.value,
						lng: gps.v.lng.value,
					}}
					accuracy={gps.v.acc && gps.v.acc.value}
					heading={gps.v.hdg && gps.v.hdg.value}
					label={cat.id}
					history={
						(data as unknown) as ({
							lat: number
							lng: number
						}[])
					}
				/>
			)}
		</HistoricalDataLoader>
	)
}
