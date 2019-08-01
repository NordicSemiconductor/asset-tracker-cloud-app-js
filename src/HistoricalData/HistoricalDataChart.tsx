import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import React, { useEffect, useRef } from 'react'
import { v4 } from 'uuid'
import Athena from 'aws-sdk/clients/athena'
import { exponential } from 'backoff'

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
	useEffect(() => {
		athena
			.startQueryExecution({
				WorkGroup: athenaWorkGroup,
				QueryString: `SELECT * FROM ${athenaDataBase}.${athenaRawDataTable} WHERE deviceId='${deviceId}' AND reported.bat IS NOT NULL`,
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
				})
					.then(() => athena.getQueryResults({ QueryExecutionId }).promise())
			})
			.then(console.log)
			.catch(console.error)

		const chart = am4core.create(uuid.current, am4charts.XYChart)
		chartRef.current = chart

		const data = []
		let value = 50
		for (let i = 0; i < 300; i++) {
			const date = new Date()
			date.setHours(0, 0, 0, 0)
			date.setDate(i)
			value -= Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10)
			data.push({ date: date, value: value })
		}

		chart.data = data

		const dateAxis = chart.xAxes.push(
			new am4charts.DateAxis<am4charts.AxisRendererX>(),
		)
		dateAxis.fontSize = 10
		dateAxis.renderer.minGridDistance = 60

		const valueAxes = chart.yAxes.push(
			new am4charts.ValueAxis<am4charts.AxisRendererY>(),
		)
		valueAxes.fontSize = 10

		const series = chart.series.push(new am4charts.LineSeries())
		series.dataFields.valueY = 'value'
		series.dataFields.dateX = 'date'
		series.tooltipText = '{value}'
		return () => {
			chartRef.current && chartRef.current.dispose()
		}
	}, [athena, deviceId])

	return <div id={uuid.current} className={'historicalDataChart'} />
}
