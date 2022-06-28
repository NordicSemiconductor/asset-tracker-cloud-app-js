import { RSRP, SignalQualityTriangle } from '@nordicsemiconductor/rsrp-bar'
import { identifyIssuer } from 'e118-iin-list/dist/index.js'
import { filter as filterOperator, Operator as Op } from 'mcc-mnc-list'
import styled from 'styled-components'
import { emojify } from '../Emojify/Emojify'
import { ReportedTime } from '../ReportedTime/ReportedTime'
import { TextWithIcon } from '../TextWithIcon/TextWithIcon'

const StyledSignalQualityTriangle = styled(SignalQualityTriangle)`
	width: 20px;
	height: 20px;
	margin-right: 0.2rem;
`
export const SignalQuality = ({ dbm }: { dbm: number }) => (
	<RSRP
		dbm={dbm}
		renderBar={({ quality, dbm }) => (
			<>
				<StyledSignalQualityTriangle quality={quality} />
				<small>{`(${dbm}dBm)`}</small>
			</>
		)}
		renderInvalid={() => (
			<abbr title={`Unexpected value ${dbm} reported!`}>{emojify('❎')}</abbr>
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
	const maybeSimIssuer = iccid !== undefined ? identifyIssuer(iccid) : undefined
	return (
		<div className={'info connection-information'}>
			<TextWithIcon icon={SignalQuality({ dbm: rsrp })}>
				<>
					&nbsp;
					<Operator op={filterOperator({ mccmnc: `${mccmnc}` })[0]} />
				</>
			</TextWithIcon>
			<abbr title={'Network mode'}>{emojify(`📶 ${networkMode ?? '?'}`)}</abbr>
			<abbr title={'SIM issuer'}>
				{emojify(
					`📱 ${
						maybeSimIssuer !== undefined ? maybeSimIssuer.companyName : '?'
					}`,
				)}
			</abbr>
			<ReportedTime
				receivedAt={receivedAt}
				reportedAt={reportedAt}
				staleAfterSeconds={dataStaleAfterSeconds}
			/>
		</div>
	)
}
