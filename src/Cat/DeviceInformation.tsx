import React from 'react'
import { ReportedTime } from './ReportedTime'
import styled from 'styled-components'

import { DeviceInformation, RoamingInformation } from '../DeviceShadow'

const DeviceInformationDiv = styled.div`
	dl {
		display: grid;
		grid-template: auto / 1fr 3fr;
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
	}
	.reportedTime {
		font-size: 85%;
		opacity: 0.75;
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
		<DeviceInformationDiv>
			<h4>Hard- and Software</h4>
			<dl>
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
			</dl>
			<h4>Connection</h4>
			<dl>
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
			</dl>
			<ReportedTime
				receivedAt={
					roaming ? roaming.v.rsrp.receivedAt : device.v.brdV.receivedAt
				}
				reportedAt={new Date(roaming ? roaming.ts.value : device.ts.value)}
			/>
		</DeviceInformationDiv>
	)
}
