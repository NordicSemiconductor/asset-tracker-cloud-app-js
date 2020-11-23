import React from 'react'
import { ReportedTime } from '../ReportedTime/ReportedTime'
import styled from 'styled-components'
import {
	ReportedRoamingInformation,
	ReportedDeviceInformation,
} from '../@types/device-state'

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
	appV,
}: {
	device: ReportedDeviceInformation
	roaming?: ReportedRoamingInformation
	appV?: string
}) => (
	<div>
		<h4>Hard- and Software</h4>
		<DeviceInformationDl>
			<dt>Board</dt>
			<dd>
				<code>{device.v.value.brdV}</code>
			</dd>
			<dt>Modem</dt>
			<dd>
				<code>{device.v.value.modV}</code>
			</dd>
			<dt>Application</dt>
			<dd>
				<code>{appV ?? '—'}</code>
			</dd>
		</DeviceInformationDl>
		<h4>Connection</h4>
		<DeviceInformationDl>
			<dt>Band</dt>
			<dd>
				<code>{device.v.value.band}</code>
			</dd>
			<dt>ICCID</dt>
			<dd>
				<code>{device.v.value.iccid}</code>
			</dd>
			{roaming && (
				<>
					<dt>MCC/MNC</dt>
					<dd>
						<code>{roaming.v.value.mccmnc}</code>
					</dd>
					<dt>Area Code</dt>
					<dd>
						<code>{roaming.v.value.area}</code>
					</dd>
					<dt>CellID</dt>
					<dd>
						<code>{roaming.v.value.cell}</code>
					</dd>
					<dt>IP</dt>
					<dd>
						<code>{roaming.v.value.ip}</code>
					</dd>
				</>
			)}
		</DeviceInformationDl>
		<StyledReportedTime
			receivedAt={roaming?.v.receivedAt ?? device.v.receivedAt}
			reportedAt={new Date(roaming?.ts.value ?? device.ts.value)}
		/>
	</div>
)
