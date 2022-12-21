import * as am4charts from '@amcharts/amcharts4/charts'
import * as am4core from '@amcharts/amcharts4/core'
import { useEffect, useRef } from 'react'
import styled from 'styled-components'
import { randomUUID } from 'node:crypto'

const HistoricalDataChartDiv = styled.div`
	width: 100%;
	height: 300px;
`

export const HistoricalDataChart = ({
	data,
	type,
	min,
	max,
}: {
	data: { date: Date; value: number }[]
	type: 'line' | 'column'
	min?: number
	max?: number
}) => {
	const chartRef = useRef<am4charts.XYChart>()
	const uuid = useRef<string>(randomUUID())

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
		valueAxes.min = min
		valueAxes.max = max

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
			chartRef.current?.dispose()
		}
	}, [data, type, min, max])

	return <HistoricalDataChartDiv id={uuid.current} />
}
