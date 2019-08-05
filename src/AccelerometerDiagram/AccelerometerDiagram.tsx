import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import React, { useEffect, useRef } from 'react'
import { v4 } from 'uuid'

import './AccelerometerDiagram.scss'

const axes = {
	Z: 2,
	Y: 1,
	X: 0,
}

export const AccelerometerDiagram = ({ values }: { values: number[] }) => {
	const chartRef = useRef<am4charts.RadarChart>()
	const uuid = useRef<string>(v4())
	useEffect(() => {
		const chart = am4core.create(uuid.current, am4charts.RadarChart)
		chartRef.current = chart

		const data = [] as { direction: string; value: number }[]

		Object.entries(axes).forEach(([dir, k]) => {
			if (values[k] < 0) {
				data.push({
					direction: `-${dir}`,
					value: Math.abs(values[k]),
				})
			} else {
				data.push({
					direction: `+${dir}`,
					value: values[k],
				})
			}
		})

		chart.data = data

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
