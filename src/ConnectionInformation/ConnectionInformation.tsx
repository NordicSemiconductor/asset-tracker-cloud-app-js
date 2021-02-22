import React from 'react'
import { filter as filterOperator, Operator as Op } from 'mcc-mnc-list'
import { ReportedTime } from '../ReportedTime/ReportedTime'
import { TextWithIcon } from '../TextWithIcon/TextWithIcon'
import { emojify } from '../Emojify/Emojify'
import styled from 'styled-components'
import { RSRP, RSRPBar } from '@nordicsemiconductor/rsrp-bar'
import { identifyIssuer } from 'e118-iin-list'
import { isSome, none } from 'fp-ts/lib/Option'

const StyledRSRPBar = styled(RSRPBar)`
	width: 20px;
	height: 20px;
	margin-right: 0.2rem;
`
export const SignalQuality = ({ rsrp }: { rsrp: number }) => (
	<RSRP
		rsrp={rsrp}
		renderBar={({ quality, dbm }) =>
			quality === 0 ? (
				<abbr title={'Not known or not detectable'}>
					<StyledRSRPBar quality={0} />
				</abbr>
			) : (
				<>
					<StyledRSRPBar quality={quality} />
					<small>{`(${dbm}dBm)`}</small>
				</>
			)
		}
		renderInvalid={() => (
			<abbr title={`Unexpected value ${rsrp} reported!`}>{emojify('❎')}</abbr>
		)}
	/>
)

export const Operator = ({ op }: { op?: Op }) => (
	<span className={'operator'}>{op?.brand ?? 'Unknown'}</span>
)

export const ConnectionInformation = ({
	networkMode,
	rsrp,
	mccmnc,
	receivedAt,
	reportedAt,
	iccid,
	dataStaleAfterSeconds,
}: {
	networkMode?: string
	iccid?: string
	rsrp: number
	mccmnc: number
	receivedAt: Date
	reportedAt: Date
	dataStaleAfterSeconds: number
}) => {
	const maybeSimIssuer = iccid !== undefined ? identifyIssuer(iccid) : none
	const simIssuer = isSome(maybeSimIssuer)
		? maybeSimIssuer.value.companyName
		: false
	return (
		<div className={'info connection-information'}>
			<TextWithIcon icon={SignalQuality({ rsrp })}>
				<>
					&nbsp;
					<Operator op={filterOperator({ mccmnc: `${mccmnc}` })[0]} />
				</>
			</TextWithIcon>
			<abbr title={'Network mode'}>{emojify(`📶 ${networkMode ?? '?'}`)}</abbr>
			<abbr title={'SIM issuer'}>{emojify(`📱 ${simIssuer ?? '?'}`)}</abbr>
			<ReportedTime
				receivedAt={receivedAt}
				reportedAt={reportedAt}
				staleAfterSeconds={dataStaleAfterSeconds}
			/>
		</div>
	)
}
