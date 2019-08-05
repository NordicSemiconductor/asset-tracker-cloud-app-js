import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import React, { useEffect, useRef, useState } from 'react'
import { v4 } from 'uuid'
import Athena from 'aws-sdk/clients/athena'
import { exponential } from 'backoff'
import { parseAthenaResult } from '../parseAthenaResult'
import { Loading } from '../Loading/Loading'
import { Error as ShowError } from '../Error/Error'

import './HistoricalDataChart.scss'

const athenaWorkGroup = process.env.REACT_APP_ATHENA_WORK_GROUP_NAME
const athenaDataBase = process.env.REACT_APP_ATHENA_DATA_BASE_NAME
const athenaRawDataTable = process.env.REACT_APP_ATHENA_RAW_DATA_TABLE_NAME

export const HistoricalDataChart = ({
	athena,
	deviceId,
}: {
	athena: Athena
	deviceId: string
}) => {
	const chartRef = useRef<am4charts.XYChart>()
	const uuid = useRef<string>(v4())
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error>()
	useEffect(() => {
		const chart = am4core.create(uuid.current, am4charts.XYChart)
		chartRef.current = chart

		const dateAxis = chart.xAxes.push(
			new am4charts.DateAxis<am4charts.AxisRendererX>(),
		)
		dateAxis.fontSize = 10
		dateAxis.baseInterval = { timeUnit: 'second', count: 1 }
		chart.dateFormatter.inputDateFormat = 'yyyy-MM-ddTHH:mm:ss.SSSZ'

		const valueAxes = chart.yAxes.push(
			new am4charts.ValueAxis<am4charts.AxisRendererY>(),
		)
		valueAxes.fontSize = 10

		const series = chart.series.push(new am4charts.LineSeries())
		series.dataFields.valueY = 'value'
		series.dataFields.dateX = 'date'
		series.tooltipText = '{value}'
		series.tooltipPosition = 'pointer'

		chart.cursor = new am4charts.XYCursor()
		chart.cursor.snapToSeries = series
		chart.cursor.xAxis = dateAxis

		// Add scrollbar
		chart.scrollbarX = new am4charts.XYChartScrollbar()
		;(chart.scrollbarX as am4charts.XYChartScrollbar).series.push(series)

		// Create vertical scrollbar and place it before the value axis
		chart.scrollbarY = new am4core.Scrollbar()
		chart.scrollbarY.parent = chart.leftAxesContainer
		chart.scrollbarY.toBack()

		const QueryString = `SELECT reported.bat.ts as date, reported.bat.v as value FROM ${athenaDataBase}.${athenaRawDataTable} WHERE deviceId='${deviceId}' AND reported.bat IS NOT NULL ORDER BY reported.bat.ts DESC LIMIT 100`
		console.log(QueryString)
		athena
			.startQueryExecution({
				WorkGroup: athenaWorkGroup,
				QueryString,
			})
			.promise()
			.then(({ QueryExecutionId }) => {
				if (!QueryExecutionId) {
					throw new Error(`Query failed!`)
				}
				return new Promise(async (resolve, reject) => {
					const b = exponential({
						randomisationFactor: 0,
						initialDelay: 1000,
						maxDelay: 5000,
					})
					b.failAfter(9) // 27750
					b.on('ready', async () => {
						const res = await athena
							.getQueryExecution({ QueryExecutionId })
							.promise()
						const State =
							(res.QueryExecution &&
								res.QueryExecution.Status &&
								res.QueryExecution.Status.State) ||
							'unknown'

						switch (State) {
							case 'RUNNING':
								console.debug(res)
								b.backoff()
								break
							case 'FAILED':
								console.error(res.QueryExecution)
								reject(new Error(`Query ${QueryExecutionId} failed!`))
								break
							case 'SUCCEEDED':
								resolve(res)
								break
							case 'unknown':
								reject(
									new Error(`Query ${QueryExecutionId} has unknown status!`),
								)
								break
							default:
								console.error(res)
								reject(
									new Error(`Query ${QueryExecutionId} has unexpected status!`),
								)
						}
					})
					b.on('fail', () => {
						reject(new Error(`Timed out waiting for query ${QueryExecutionId}`))
					})
					b.backoff()
				}).then(() => athena.getQueryResults({ QueryExecutionId }).promise())
			})
			.then(({ ResultSet }) => {
				if (!ResultSet || !ResultSet.Rows) {
					throw new Error(`No resultset returned.`)
				}
				return parseAthenaResult({
					ResultSet,
					formatters: {
						integer: v => parseInt(v, 10) / 1000,
					},
				})
			})
			.then(data => {
				setLoading(false)
				console.log('Chart data', data)
				chart.data = data
			})
			.catch(setError)

		return () => {
			chartRef.current && chartRef.current.dispose()
		}
	}, [athena, deviceId, setLoading, setError])

	return (
		<>
			{loading && <Loading text={`Fetching historical data...`} />}
			{error && <ShowError error={error} />}
			<div id={uuid.current} className={'historicalDataChart'} />
		</>
	)
}
