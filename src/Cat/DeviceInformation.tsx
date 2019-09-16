import React from 'react'
import { ReportedTime } from './ReportedTime'
import styled from 'styled-components'

import { DeviceInformation, RoamingInformation } from '../DeviceShadow'

const StyledReportedTime = styled(ReportedTime)`
	font-size: 85%;
	opacity: 0.75;
`

export const DeviceInformationDl = styled.dl`
	display: grid;
	grid-template: auto / 1fr 2fr;
	dt,
	dd {
		font-weight: normal;
		padding: 0;
		margin: 0;
		border-bottom: 1px solid #f0f0f0;
	}
	dt {
		padding-right: 1rem;
	}
	dt {
		flex-grow: 1;
	}
`

export const DeviceInfo = ({
	device,
	roaming,
}: {
	device: DeviceInformation
	roaming?: RoamingInformation
}) => {
	return (
		<div>
			<h4>Hard- and Software</h4>
			<DeviceInformationDl>
				<dt>Board</dt>
				<dd>
					<code>{device.v.brdV.value}</code>
				</dd>
				<dt>Modem</dt>
				<dd>
					<code>{device.v.modV.value}</code>
				</dd>
				<dt>Application</dt>
				<dd>
					<code>{device.v.appV.value}</code>
				</dd>
			</DeviceInformationDl>
			<h4>Connection</h4>
			<DeviceInformationDl>
				<dt>Band</dt>
				<dd>
					<code>{device.v.band.value}</code>
				</dd>
				<dt>ICCID</dt>
				<dd>
					<code>{device.v.iccid.value}</code>
				</dd>
				{roaming && (
					<>
						<dt>MCC/MNC</dt>
						<dd>
							<code>{roaming.v.mccmnc.value}</code>
						</dd>
						<dt>Area Code</dt>
						<dd>
							<code>{roaming.v.area.value}</code>
						</dd>
						<dt>CellID</dt>
						<dd>
							<code>{roaming.v.cell.value}</code>
						</dd>
						<dt>IP</dt>
						<dd>
							<code>{roaming.v.ip.value}</code>
						</dd>
					</>
				)}
			</DeviceInformationDl>
			<StyledReportedTime
				receivedAt={
					roaming ? roaming.v.rsrp.receivedAt : device.v.brdV.receivedAt
				}
				reportedAt={new Date(roaming ? roaming.ts.value : device.ts.value)}
			/>
		</div>
	)
}
