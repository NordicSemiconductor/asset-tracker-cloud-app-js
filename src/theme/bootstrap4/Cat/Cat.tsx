import React from 'react'
import { CardBody, CardHeader } from 'reactstrap'
import { ReportedState } from '../../../@types/device-state'
import { DeviceInfo } from '../../../DeviceInformation/DeviceInformation'
import { Toggle } from '../../Toggle/Toggle'
import { Collapsable } from '../../Collapsable/Collapsable'
import { CatCard } from './CatCard'
import { ConnectionInformation } from '../../ConnectionInformation'
import { LoadedCatWithIdentity } from '../../../Cat/CatLoader'
import { emojify } from '../../Emojify/Emojify'
import { ReportedTime } from '../../../ReportedTime/ReportedTime'

export const Cat = ({
	cat,
	state,
	dataStaleAfterSeconds,
	appV,
}: {
	cat: LoadedCatWithIdentity
	state?: ReportedState
	appV?: string
	dataStaleAfterSeconds: number
}) => (
	<CatCard>
		<CardHeader>
			{state?.roam !== undefined && (
				<Toggle>
					<ConnectionInformation
						mccmnc={state.roam.v.value.mccmnc}
						rsrp={state.roam.v.value.rsrp}
						receivedAt={state.roam.v.receivedAt}
						reportedAt={new Date(state.roam.ts.value)}
						networkMode={state?.dev?.v.value.nw}
						iccid={state?.dev?.v.value.iccid}
						dataStaleAfterSeconds={dataStaleAfterSeconds}
					/>
				</Toggle>
			)}
			{state?.gps !== undefined && (
				<Toggle>
					<div className={'info'}>
						{state.gps.v.value.spd !== undefined &&
							emojify(` 🏃${Math.round(state.gps.v.value.spd)}m/s`)}
						{state.gps.v.value.alt !== undefined &&
							emojify(`✈️ ${Math.round(state.gps.v.value.alt)}m`)}
						<ReportedTime
							receivedAt={state.gps.v.receivedAt}
							reportedAt={new Date(state.gps.ts.value)}
							staleAfterSeconds={dataStaleAfterSeconds}
						/>
					</div>
				</Toggle>
			)}
			{state?.bat !== undefined && (
				<Toggle>
					<div className={'info'}>
						{emojify(`🔋 ${state.bat.v.value / 1000}V`)}
						<span />
						<ReportedTime
							receivedAt={state.bat.v.receivedAt}
							reportedAt={new Date(state.bat.ts.value)}
							staleAfterSeconds={dataStaleAfterSeconds}
						/>
					</div>
				</Toggle>
			)}
			{state?.env !== undefined && (
				<Toggle>
					<div className={'info'}>
						{emojify(`🌡️ ${state.env.v.value.temp}°C`)}
						{emojify(`💦 ${Math.round(state.env.v.value.hum)}%`)}
						<ReportedTime
							receivedAt={state.env.v.receivedAt}
							reportedAt={new Date(state.env.ts.value)}
							staleAfterSeconds={dataStaleAfterSeconds}
						/>
					</div>
				</Toggle>
			)}
		</CardHeader>
		<CardBody>
			{JSON.stringify({ cat })}
			{state?.dev !== undefined && (
				<Collapsable id={'cat:information'} title={'ℹ️ Device Information'}>
					<DeviceInfo
						key={`${cat.version}`}
						device={state.dev}
						roaming={state.roam}
						appV={appV}
						dataStaleAfterSeconds={dataStaleAfterSeconds}
					/>
				</Collapsable>
			)}
		</CardBody>
	</CatCard>
)
