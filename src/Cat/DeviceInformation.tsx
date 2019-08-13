import React from 'react'
import { ReportedTime } from './ReportedTime'

import './DeviceInformation.scss'

export type DeviceInformation = {
	v: {
		band: {
			value: number
			receivedAt: Date
		}
		nw: {
			value: string
			receivedAt: Date
		}
		iccid: {
			value: string
			receivedAt: Date
		}
		modV: {
			value: string
			receivedAt: Date
		}
		brdV: {
			value: string
			receivedAt: Date
		}
		appV: {
			value: string
			receivedAt: Date
		}
	}
	ts: {
		value: number
		receivedAt: Date
	}
}

export type RoamingInformation = {
	v: {
		area: {
			value: number
			receivedAt: Date
		}
		mccmnc: {
			value: number
			receivedAt: Date
		}
		cell: {
			value: number
			receivedAt: Date
		}
		ip: {
			value: string
			receivedAt: Date
		}
		rsrp: {
			value: number
			receivedAt: Date
		}
	}
	ts: {
		value: number
		receivedAt: Date
	}
}

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
