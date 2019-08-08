import React, { useEffect, useState } from 'react'
import Athena from 'aws-sdk/clients/athena'
import {
	athenaQuery,
	parseAthenaResult,
	FieldFormatters,
} from '@bifravst/athena-helpers'
import { Loading } from '../Loading/Loading'
import { Error as ShowError } from '../Error/Error'

import './HistoricalDataChart.scss'

export const HistoricalDataLoader = ({
	athena,
	deviceId,
	children,
	QueryString,
	workGroup,
	formatFields,
}: {
	athena: Athena
	deviceId: string
	QueryString: string
	workGroup: string
	formatFields?: FieldFormatters
	children: (args: {
		data: { date: Date; value: number }[]
	}) => React.ReactElement<any>
}) => {
	const [data, setData] = useState()
	const [error, setError] = useState<Error>()
	useEffect(() => {
		let removed = false
		const q = athenaQuery({
			WorkGroup: workGroup,
			athena,
			debugLog: (...args: any) => {
				console.debug('[athena]', ...args)
			},
			errorLog: (...args: any) => {
				console.error('[athena]', ...args)
			},
		})
		q({ QueryString })
			.then(async ResultSet => {
				if (removed) {
					console.debug(
						'[Historical Data]',
						'Received result, but was removed already.',
					)
					return
				}
				const data = parseAthenaResult({
					ResultSet,
					formatFields,
					skip: 1,
				})
				console.debug('[Historical Data]', data)
				setData(data)
			})
			.catch(setError)
		return () => {
			removed = true
		}
	}, [athena, deviceId, workGroup, QueryString, formatFields])

	return (
		<>
			{!data && <Loading text={`Fetching historical data...`} />}
			{error && <ShowError error={error} />}
			{data && children({ data })}
		</>
	)
}
