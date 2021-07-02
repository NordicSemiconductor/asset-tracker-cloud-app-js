import React, { useEffect, useState } from 'react'
import { ReportedTime } from '../ReportedTime/ReportedTime'
import { NCellMeasReport } from '../@types/device-state'
import { isSome, Option } from 'fp-ts/lib/Option'
import styled from 'styled-components'

const StyledReportedTime = styled(ReportedTime)`
	font-size: 85%;
	opacity: 0.75;
`

export const NeighborCellMeasurementsReport = ({
	getNeighboringCellMeasurementReport,
}: {
	getNeighboringCellMeasurementReport: () => Promise<Option<NCellMeasReport>>
}) => {
	const [report, setReport] = useState<NCellMeasReport>()
	useEffect(() => {
		let isMounted = true
		void getNeighboringCellMeasurementReport().then((report) => {
			if (isMounted && isSome(report)) {
				setReport(report.value)
			}
		})
		return () => {
			isMounted = false
		}
	}, [getNeighboringCellMeasurementReport])

	if (report === undefined) return null
	return (
		<>
			<hr />
			<h4>Neighbor Cell Measurement</h4>
			<pre>{JSON.stringify(report, null, 2)}</pre>
			<StyledReportedTime
				receivedAt={report.receivedAt}
				reportedAt={report.reportedAt}
			/>
		</>
	)
}
