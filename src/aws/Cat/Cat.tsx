import { default as introJs } from 'intro.js'
import { ICredentials } from '@aws-amplify/core'
import React, { useEffect, useState } from 'react'
import { Toggle } from '../../theme/Toggle/Toggle'
import { emojify } from '../../theme/Emojify/Emojify'
import { ReportedTime } from '../../ReportedTime/ReportedTime'
import { DeviceInfo } from '../../DeviceInformation/DeviceInformation'
import { CollapsedContextConsumer } from '../../util/CollapsedContext'
import {
	MobileOnlyCatHeader,
	CatPersonalization,
} from '../../Cat/CatPersonality'
import { ThingState } from '../../@types/aws-device'
import { DeviceConfig } from '../../@types/device-state'
import { Settings } from '../../Settings/Settings'
import { toReportedWithReceivedAt } from '../toReportedWithReceivedAt'
import { Option, isSome } from 'fp-ts/lib/Option'
import { ErrorInfo } from '../../Error/ErrorInfo'

const intro = introJs()

export type CatInfo = {
	id: string
	name: string
	avatar: string
	version: number
}

const isNameValid = (name: string) => /^[0-9a-z_.,@/:#-]{1,800}$/i.test(name)

export const Cat = ({
	cat,
	onAvatarChange,
	onNameChange,
	credentials,
	children,
	getThingState,
	updateDeviceConfig,
	listenForStateChange,
	catMap,
	renderError,
	renderConnectionInformation,
	render,
	renderCollapsable,
	renderDivider,
}: {
	onAvatarChange: (avatar: Blob) => void
	onNameChange: (name: string) => void
	getThingState: () => Promise<Option<ThingState>>
	updateDeviceConfig: (cfg: Partial<DeviceConfig>) => Promise<void>
	cat: CatInfo
	credentials: ICredentials
	children: JSX.Element | JSX.Element[]
	listenForStateChange: (listeners: {
		onNewState: (newState: ThingState) => void
	}) => Promise<() => void>
	catMap: (state: ThingState) => JSX.Element
	renderError: (args: { error: Error | ErrorInfo }) => JSX.Element
	renderConnectionInformation: (args: {
		networkMode?: string
		iccid?: string
		rsrp: number
		mccmnc: number
		receivedAt: Date
		reportedAt: Date
		dataStaleAfterSeconds: number
	}) => JSX.Element
	render: (args: {
		header: JSX.Element
		body: JSX.Element
		map?: JSX.Element
	}) => JSX.Element
	renderCollapsable: (args: {
		title: string
		id: string
		children: JSX.Element | JSX.Element[]
	}) => JSX.Element
	renderDivider: () => JSX.Element
}) => {
	const [state, setState] = useState<ThingState>()
	const [error, setError] = useState<Error>()
	const reported = state?.reported

	// Fetch Thing state
	useEffect(() => {
		let didCancel = false
		const setStateIfNotCanceled = (state: ThingState) =>
			!didCancel && setState(state)
		const setErrorIfNotCanceled = (error: Error) =>
			!didCancel && setError(error)

		getThingState()
			.then((maybeState) => {
				if (isSome(maybeState)) {
					setStateIfNotCanceled(maybeState.value)
				}
			})
			.catch(setErrorIfNotCanceled)

		return () => {
			didCancel = true
		}
	}, [credentials, getThingState])

	// Once state is fetched, listen to state changes
	useEffect(() => {
		let didCancel = false
		let stopListening: () => void
		const setErrorIfNotCanceled = (error: Error) =>
			!didCancel && setError(error)
		if (state === undefined) return

		listenForStateChange({
			onNewState: (newState) => {
				setState((state) => ({ ...state, ...newState }))
			},
		})
			.then((s) => {
				if (didCancel) {
					s()
				}
				stopListening = s
			})
			.catch(setErrorIfNotCanceled)

		return () => {
			if (stopListening !== undefined) {
				console.log('Stopping listening...')
				stopListening()
			}
			didCancel = true
		}
	}, [state, listenForStateChange])

	useEffect(() => {
		if (!error) {
			setTimeout(() => {
				window.requestAnimationFrame(() => {
					if (window.localStorage.getItem('asset-tracker:cat:intro') === null) {
						intro.start()
						intro.onexit(() => {
							window.localStorage.setItem('asset-tracker:cat:intro', 'done')
						})
						console.log('Starting Intro.js')
					}
				})
			}, 1000)
		}
	}, [error])

	if (error) return renderError({ error })

	const reportedWithReceived =
		state?.reported &&
		toReportedWithReceivedAt({
			reported: state.reported,
			metadata: state.metadata,
		})

	// Calculate the interval in which the device is expected to publish data
	const expectedSendIntervalInSeconds =
		(state?.reported.cfg?.act ?? true // default device mode is active
			? state?.reported.cfg?.actwt ?? 120 // default active wait time is 120 seconds
			: state?.reported.cfg?.mvt ?? 3600) + // default movement timeout is 3600
		(state?.reported.cfg?.gpst ?? 60) + // default GPS timeout is 60 seconds
		60 // add 1 minute for sending and processing

	return render({
		map: state && catMap(state),
		header: (
			<>
				<CollapsedContextConsumer>
					{({ visible: showCat }) =>
						showCat ? (
							<MobileOnlyCatHeader
								cat={cat}
								isNameValid={isNameValid}
								onAvatarChange={onAvatarChange}
								onNameChange={onNameChange}
							/>
						) : null
					}
				</CollapsedContextConsumer>
				{reported && (
					<>
						{reportedWithReceived?.roam !== undefined && (
							<Toggle>
								{renderConnectionInformation({
									mccmnc: reportedWithReceived.roam.v.value.mccmnc,
									rsrp: reportedWithReceived.roam.v.value.rsrp,
									receivedAt: reportedWithReceived.roam.v.receivedAt,
									reportedAt: new Date(reportedWithReceived.roam.ts.value),
									networkMode: reportedWithReceived.dev?.v.value.nw,
									iccid: reportedWithReceived.dev?.v.value.iccid,
									dataStaleAfterSeconds: expectedSendIntervalInSeconds,
								})}
							</Toggle>
						)}
						{reportedWithReceived?.gps && (
							<Toggle>
								<div className={'info'}>
									{reportedWithReceived.gps.v.value.spd !== undefined &&
										emojify(
											` 🏃${Math.round(
												reportedWithReceived.gps.v.value.spd,
											)}m/s`,
										)}
									{reportedWithReceived.gps.v.value.alt !== undefined &&
										emojify(
											`✈️ ${Math.round(reportedWithReceived.gps.v.value.alt)}m`,
										)}
									<ReportedTime
										receivedAt={reportedWithReceived.gps.v.receivedAt}
										reportedAt={new Date(reportedWithReceived.gps.ts.value)}
										staleAfterSeconds={expectedSendIntervalInSeconds}
									/>
								</div>
							</Toggle>
						)}
						{reportedWithReceived?.bat && (
							<Toggle>
								<div className={'info'}>
									{emojify(`🔋 ${reportedWithReceived.bat.v.value / 1000}V`)}
									<span />
									<ReportedTime
										receivedAt={reportedWithReceived.bat.v.receivedAt}
										reportedAt={new Date(reportedWithReceived.bat.ts.value)}
										staleAfterSeconds={expectedSendIntervalInSeconds}
									/>
								</div>
							</Toggle>
						)}
						{reportedWithReceived?.env && (
							<Toggle>
								<div className={'info'}>
									{emojify(`🌡️ ${reportedWithReceived.env.v.value.temp}°C`)}
									{emojify(
										`💦 ${Math.round(reportedWithReceived.env.v.value.hum)}%`,
									)}
									<ReportedTime
										receivedAt={reportedWithReceived.env.v.receivedAt}
										reportedAt={new Date(reportedWithReceived.env.ts.value)}
										staleAfterSeconds={expectedSendIntervalInSeconds}
									/>
								</div>
							</Toggle>
						)}
					</>
				)}
			</>
		),
		body: (
			<>
				{renderCollapsable({
					title: '⭐ Personalization',
					id: 'cat:personalization',
					children: (
						<CatPersonalization
							cat={cat}
							isNameValid={isNameValid}
							onAvatarChange={onAvatarChange}
							onNameChange={onNameChange}
						/>
					),
				})}
				{state && (
					<>
						{renderDivider()}
						{renderCollapsable({
							id: 'cat:settings',
							title: '⚙️ Settings',
							children: (
								<Settings
									reported={reportedWithReceived?.cfg}
									desired={state.desired?.cfg}
									key={JSON.stringify(state?.desired?.cfg ?? {})}
									onSave={(config) => {
										updateDeviceConfig(config)
											.catch(setError)
											.then(() => {
												setState((state) => {
													if (state) {
														return {
															...state,
															desired: {
																...state.desired,
																cfg: config,
															},
														}
													}
												})
											})
											.catch(setError)
									}}
								/>
							),
						})}
					</>
				)}
				{reportedWithReceived?.dev && (
					<>
						{renderDivider()}
						{renderCollapsable({
							id: 'cat:information',
							title: 'ℹ️ Device Information',
							children: (
								<DeviceInfo
									key={`${cat.version}`}
									device={reportedWithReceived.dev}
									roaming={reportedWithReceived.roam}
									appV={reportedWithReceived.dev?.v?.value?.appV}
									dataStaleAfterSeconds={expectedSendIntervalInSeconds}
								/>
							),
						})}
					</>
				)}
				{children}
			</>
		),
	})
}
