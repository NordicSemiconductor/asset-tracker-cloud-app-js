import React from 'react'
import { filter as filterOperator, Operator as Op } from 'mcc-mnc-list'
import { ReportedTime } from './ReportedTime'
import { DeviceInformation, RoamingInformation } from '../@types/DeviceShadow'
import { TextWithIcon } from '../TextWithIcon/TextWithIcon'
import { emojify } from '../Emojify/Emojify'
import { rsrpToPercent } from './rsrpToPercent'
import styled from 'styled-components'
import { RSRPBar } from './RSRPBar'

const StyledRSRPBar = styled(RSRPBar)`
	width: 20px;
	height: 20px;
`
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
export const RSRP = ({ rsrp: { value } }: { rsrp: { value: number } }) => {
	if (value === 255) {
		return (
			<abbr title={'Not known or not detectable'}>
				<StyledRSRPBar quality={0} />
			</abbr>
		)
	}

	if (value >= 0 && value <= 140) {
		const dbm = -140 + value
		const quality = rsrpToPercent(dbm)
		return (
			<>
				<StyledRSRPBar quality={quality} />
				<small>{`(${dbm}dBm)`}</small>
			</>
		)
	}
	return (
		<abbr title={`Unexpected value ${value} reported!`}>{emojify('❎')}</abbr>
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
	device?: DeviceInformation
	roaming: RoamingInformation
}) => {
	const {
		v: {
			rsrp,
			mccmnc: { value: mccmnc },
		},
	} = roaming
	const nw = device && device.v.nw.value
	return (
		<div className={'info connection-information'}>
			<TextWithIcon icon={<RSRP rsrp={rsrp} />}>
				<>
					&nbsp;
					<Operator op={filterOperator({ mccmnc: `${mccmnc}` })[0]} />
				</>
			</TextWithIcon>
			{emojify(`📱 ${nw || '?'}`)}
			<ReportedTime
				receivedAt={roaming.v.rsrp.receivedAt}
				reportedAt={new Date(roaming.ts.value)}
			/>
		</div>
	)
}
