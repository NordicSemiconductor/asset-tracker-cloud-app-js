import React from 'react'
import { ReportedTime } from './ReportedTime'

import './DeviceInformation.scss'
import { DeviceInformation, RoamingInformation } from '../DeviceShadow'

export const DeviceInfo = ({
	device,
	roaming,
}: {
	device: DeviceInformation
	roaming?: RoamingInformation
}) => {
	return (
		<div className={'device-information'}>
			<h4>Hard and Software</h4>
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
		</div>
	)
}
