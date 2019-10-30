import Athena from 'aws-sdk/clients/athena'
import { CatInfo } from './CatLoader'
import { HistoricalDataLoader } from '../../HistoricalData/HistoricalDataLoader'
import { Map } from '../../Map/Map'
import React, { useState, useEffect } from 'react'
import { AWSIotThingState } from '../connectAndListenForStateChange'
import { NoMap } from '../../Cat/NoMap'
import { FormGroup, Label, Input } from 'reactstrap'
import styled from 'styled-components'
import { mobileBreakpoint } from '../../Styles'
import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb-v2-node'
import { cellId } from '@bifravst/cell-geolocation-helpers'

const SettingsFormGroup = styled(FormGroup)`
	position: absolute;
	padding: 0.5rem 0.5rem 0.5rem 2rem;
	background-color: #ffffffaf;
	top: 0;
	right: 0;
	z-index: 999;
	@media (min-width: ${mobileBreakpoint}) {
		top: auto;
		right: auto;
		bottom: 0;
		z-index: 10000;
	}
`

const CatMapContainer = styled.div`
	position: relative;
`

export const CatMap = ({
	athena,
	cat,
	athenaWorkGroup,
	athenaDataBase,
	athenaRawDataTable,
	cellGeoLocationTable,
	cellGeoLocationTableCellIdIndex,
	state,
	dynamoDBClient,
}: {
	athena: Athena
	cat: CatInfo
	athenaWorkGroup: string
	athenaDataBase: string
	athenaRawDataTable: string
	state: AWSIotThingState
	dynamoDBClient: DynamoDBClient
	cellGeoLocationTable: string
	cellGeoLocationTableCellIdIndex: string
}) => {
	let initialState = true

	if (
		window.localStorage.getItem(`bifravst:catmap:fetchPastPositions`) === '0'
	) {
		initialState = false
	}
	const [fetchHistoricalData, setFetchHistoricalData] = useState(initialState)

	const { reported } = state

	useEffect(() => {
		if (reported && reported.roam && reported.roam.v.area) {
			dynamoDBClient
				.send(
					new QueryCommand({
						TableName: cellGeoLocationTable,
						IndexName: cellGeoLocationTableCellIdIndex,
						KeyConditionExpression: 'cellId = :cellId',
						ExpressionAttributeValues: {
							':cellId': {
								S: cellId({
									area: reported.roam.v.area.value,
									cell: reported.roam.v.cell.value,
									mccmnc: reported.roam.v.mccmnc.value,
								}),
							},
						},
						ProjectionExpression: 'lat,lng',
					}),
				)
				.then(({ Items }) => {
					console.log('cell geolocation', Items)
				})
				.catch(err => {
					console.error(`Cell Geolocation query failed!`)
					console.error(err)
				})
		}
	}, [
		reported,
		cellGeoLocationTable,
		cellGeoLocationTableCellIdIndex,
		dynamoDBClient,
	])

	if (
		!reported ||
		!reported.gps ||
		!reported.gps.v ||
		!reported.gps.v.lat ||
		!reported.gps.v.lng
	)
		return <NoMap />

	const gps = reported.gps

	const toggle = () => {
		const state = !fetchHistoricalData
		setFetchHistoricalData(state)
		window.localStorage.setItem(
			`bifravst:catmap:fetchPastPositions`,
			state ? '1' : '0',
		)
	}

	const mapWithoutHistoricalData = (
		<Map
			position={{
				lat: gps.v.lat.value,
				lng: gps.v.lng.value,
			}}
			accuracy={gps.v.acc && gps.v.acc.value}
			heading={gps.v.hdg && gps.v.hdg.value}
			label={cat.id}
		/>
	)

	const settings = (
		<SettingsFormGroup check>
			<Label check>
				<Input
					type="checkbox"
					name="fetchHistoricalData"
					onChange={toggle}
					checked={fetchHistoricalData}
				/>{' '}
				Fetch history?
			</Label>
		</SettingsFormGroup>
	)

	if (!fetchHistoricalData) {
		return (
			<CatMapContainer>
				{mapWithoutHistoricalData}
				{settings}
			</CatMapContainer>
		)
	}

	return (
		<CatMapContainer>
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
				loading={mapWithoutHistoricalData}
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
			{settings}
		</CatMapContainer>
	)
}
