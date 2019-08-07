import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import React, { useEffect, useRef } from "react";
import { v4 } from "uuid";

import "./HistoricalDataChart.scss";

export const HistoricalDataChart = ({ data }: { data: any }) => {
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

		chart.data = data

		return () => {
			chartRef.current && chartRef.current.dispose()
		}
	}, [data])

	return <div id={uuid.current} className={'historicalDataChart'} />
}
