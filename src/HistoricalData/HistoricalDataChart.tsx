import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import React, { useEffect, useRef } from 'react'
import { v4 } from 'uuid'
import styled from 'styled-components'

const HistoricalDataChartDiv = styled.div`
	width: 100%;
	height: 300px;
`

export const HistoricalDataChart = ({
	data,
	type,
}: {
	data: { date: Date; value: number }[]
	type: 'line' | 'column'
}) => {
	const chartRef = useRef<am4charts.XYChart>()
	const uuid = useRef<string>(v4())

	useEffect(() => {
		const chart = am4core.create(uuid.current, am4charts.XYChart)
		chartRef.current = chart

		const dateAxis = chart.xAxes.push(
			new am4charts.DateAxis<am4charts.AxisRendererX>(),
		)
		dateAxis.fontSize = 10
		dateAxis.baseInterval = { timeUnit: 'second', count: 1 }

		const valueAxes = chart.yAxes.push(
			new am4charts.ValueAxis<am4charts.AxisRendererY>(),
		)
		valueAxes.fontSize = 10

		const series = chart.series.push(
			type === 'column'
				? new am4charts.ColumnSeries()
				: new am4charts.LineSeries(),
		)
		series.dataFields.valueY = 'value'
		series.dataFields.dateX = 'date'
		series.tooltipText = '{value}'
		series.tooltipPosition = 'pointer'

		chart.cursor = new am4charts.XYCursor()
		chart.cursor.snapToSeries = series
		chart.cursor.xAxis = dateAxis

		chart.data = data

		return () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			chartRef.current?.dispose()
		}
	}, [data, type])

	return <HistoricalDataChartDiv id={uuid.current} />
}
