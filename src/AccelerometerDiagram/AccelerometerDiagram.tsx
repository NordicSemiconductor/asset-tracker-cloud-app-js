import * as am4core from '@amcharts/amcharts4/core'
import * as am4charts from '@amcharts/amcharts4/charts'
import React, { useEffect, useRef } from 'react'
import { v4 } from 'uuid'
import styled from 'styled-components'

const DiagramDiv = styled.div`
	width: 100%;
	height: 250px;
`

export const AccelerometerDiagram = ({
	values,
}: {
	values: { x: number; y: number; z: number }
}): React.ReactElement => {
	const chartRef = useRef<am4charts.RadarChart>()
	const uuid = useRef<string>(v4())
	useEffect(() => {
		const chart = am4core.create(uuid.current, am4charts.RadarChart)
		chartRef.current = chart

		const data = [] as { direction: string; value: number }[]

		Object.entries(values).forEach(([dir, k]) => {
			if (k < 0) {
				data.push({
					direction: `-${dir.toUpperCase()}`,
					value: Math.abs(k),
				})
			} else {
				data.push({
					direction: `+${dir.toUpperCase()}`,
					value: k,
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
			chartRef.current?.dispose()
		}
	}, [values])

	return <DiagramDiv id={uuid.current} />
}
