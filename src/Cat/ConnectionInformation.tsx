import React from 'react'
import {
	SignalCellularNull as SignalNotDetectedIcon,
	SignalCellular0Bar as NoSignalIcon,
	SignalCellular1Bar as OneBarIcon,
	SignalCellular2Bar as TwoBarIcon,
	SignalCellular3Bar as ThreeBarIcon,
	SignalCellular4Bar as FourBarIcon,
	SignalCellularConnectedNoInternet0Bar as InvalidRSRPIcon,
	ImportExport as NetworkTypeIcon,
} from '@material-ui/icons'
import { filter as filterOperator, Operator as Op } from 'mcc-mnc-list'
import { ReportedTime } from './ReportedTime'
import { DeviceInformation, RoamingInformation } from './DeviceInformation'

/**
 * Renders the Reference Signal Received Power (RSRP).
 *
 * RSRP is the average power level received from a single reference signal in an LTE (Long-term Evolution) network.
 *
 * 0: RSRP < −140 dBm
 * 1: – When −140 dBm ≤ RSRP < −139 dBm
 * 2: When −139 dBm ≤ RSRP < −138 dBm
 * ..95: When −46 dBm ≤ RSRP < −45 dBm
 * 96: When −45 dBm ≤ RSRP < −44 dBm
 * 97: When −44 dBm ≤ RSRP
 * 255: Not known or not detectable
 */
export const RSRP = ({
	rsrp: { value, receivedAt },
}: {
	rsrp: { value: number; receivedAt: Date }
}) => {
	if (value === 255) {
		return (
			<abbr title={'Not known or not detectable'}>
				<SignalNotDetectedIcon />
			</abbr>
		)
	}
	if (value >= 0 && value <= 140) {
		const dbm = -140 + value
		let icon = <FourBarIcon />
		if (dbm <= 80) {
			icon = <ThreeBarIcon />
		} else if (dbm <= 90) {
			icon = <TwoBarIcon />
		} else if (dbm <= 100) {
			icon = <OneBarIcon />
		} else if (dbm <= 110) {
			icon = <NoSignalIcon />
		}
		return <abbr title={`${dbm}dBm`}>{icon}</abbr>
	}
	return (
		<abbr title={`Unexpected value ${value} reported!`}>
			<InvalidRSRPIcon />
		</abbr>
	)
}

export const Operator = ({ op }: { op?: Op }) => (
	<span className={'operator'}>
		{!op && 'Unknown'}
		{op && op.brand}
	</span>
)

export const ConnectionInformation = ({
	device,
	roaming,
}: {
	device: DeviceInformation
	roaming: RoamingInformation
}) => {
	console.log(roaming)
	const {
		v: {
			rsrp,
			mccmnc: { value: mccmnc },
		},
	} = roaming
	const {
		v: {
			nw: { value: nw },
		},
	} = device
	return (
		<div className={'connection-information'}>
			<span>
				<RSRP rsrp={rsrp} />
				<Operator op={filterOperator({ mccmnc: `${mccmnc}` })[0]} />
			</span>
			<span>
				<NetworkTypeIcon />
				{nw}
			</span>
			<ReportedTime
				receivedAt={roaming.v.rsrp.receivedAt}
				reportedAt={new Date(roaming.ts.value)}
			/>
		</div>
	)
}
