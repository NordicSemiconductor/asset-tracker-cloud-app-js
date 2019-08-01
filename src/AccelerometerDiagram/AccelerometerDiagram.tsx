import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import React, { useEffect, useRef } from 'react'
import { v4 } from 'uuid'

import './AccelerometerDiagram.scss'

export const AccelerometerDiagram = ({ values }: { values: number[] }) => {
	const chartRef = useRef<am4charts.RadarChart>()
	const uuid = useRef<string>(v4())
	useEffect(() => {
		const chart = am4core.create(uuid.current, am4charts.RadarChart)
		chartRef.current = chart
		chart.data = [
			{
				direction: 'Z',
				value: values[2],
			},
			{
				direction: 'Y',
				value: values[1],
			},
			{
				direction: 'X',
				value: values[0],
			},
		]

		const xAxes = new am4charts.CategoryAxis<am4charts.AxisRendererCircular>()
		xAxes.fontSize = 10
		const categoryAxis = chart.xAxes.push(xAxes)
		categoryAxis.dataFields.category = 'direction'

		const valueAxis = new am4charts.ValueAxis<am4charts.AxisRendererRadial>()
		valueAxis.min = 0
		valueAxis.fontSize = 10
		chart.yAxes.push(valueAxis)

		const series = chart.series.push(new am4charts.RadarSeries())
		series.dataFields.valueY = 'value'
		series.dataFields.categoryX = 'direction'
		series.name = 'Movement direction'
		series.strokeWidth = 1
		series.fillOpacity = 0.2
		return () => {
			chartRef.current && chartRef.current.dispose()
		}
	}, [values])

	return <div id={uuid.current} className={'accelerometerDiagram'} />
}
