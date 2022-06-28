import { isSome, Option } from 'fp-ts/lib/Option'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { NCellMeasReport } from '../@types/device-state'
import { ReportedTime } from '../ReportedTime/ReportedTime'
import { DeviceInformationDl } from './DeviceInformation'

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
			{(report.nmr?.length ?? 0) === 0 && <p>No neighboring cells found.</p>}
			{(report.nmr?.length ?? 0) > 0 && (
				<ol>
					{report.nmr?.map((cell, k) => (
						<li key={k}>
							<DeviceInformationDl>
								<dt>RSRP</dt>
								<dd>
									<code>{cell.rsrp}</code>
								</dd>
								<dt>RSRQ</dt>
								<dd>
									<code>{cell.rsrq}</code>
								</dd>
								<dt>CellID</dt>
								<dd>
									<code>{cell.cell}</code>
								</dd>
								<dt>EARFCN</dt>
								<dd>
									<code>{cell.earfcn}</code>
								</dd>
							</DeviceInformationDl>
						</li>
					))}
				</ol>
			)}
			<StyledReportedTime
				receivedAt={report.receivedAt}
				reportedAt={report.reportedAt}
			/>
		</>
	)
}
