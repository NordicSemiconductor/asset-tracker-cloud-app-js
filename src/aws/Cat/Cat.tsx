import { default as introJs } from 'intro.js'
import { FOTA, OnCreateUpgradeJob } from '../../FOTA/FOTA'
import { DeviceUpgradeFirmwareJob } from '../listUpgradeFirmwareJobs'
import { ICredentials } from '@aws-amplify/core'
import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { DisplayError } from '../../Error/Error'
import { Toggle } from '../../Toggle/Toggle'
import { ConnectionInformation } from '../../ConnectionInformation/ConnectionInformation'
import { emojify } from '../../Emojify/Emojify'
import { ReportedTime } from '../../ReportedTime/ReportedTime'
import { Collapsable } from '../../Collapsable/Collapsable'
import { DeviceInfo } from '../../DeviceInformation/DeviceInformation'
import { AccelerometerDiagram } from '../../AccelerometerDiagram/AccelerometerDiagram'
import { CatCard } from '../../Cat/CatCard'
import { CatHeader, CatPersonalization } from '../../Cat/CatPersonality'
import { ThingState, ThingReportedConfig } from '../../@types/aws-device'
import { DeviceConfig } from '../../@types/device-state'
import { Settings, ReportedConfigState } from '../../Settings/Settings'

const intro = introJs()

export type CatInfo = {
	id: string
	name: string
	avatar: string
	version: number
}

const isNameValid = (name: string) => /^[0-9a-z_.,@/:#-]{1,800}$/i.test(name)

const toReportedConfig = (
	cfg: ThingReportedConfig,
): Partial<ReportedConfigState> => {
	let c = {} as Partial<ReportedConfigState>
	Object.keys(cfg).forEach(k => {
		c = {
			...c,
			[k as keyof ReportedConfigState]: {
				value: cfg?.[k as keyof ReportedConfigState]?.value,
				receivedAt: cfg?.[k as keyof ReportedConfigState]?.receivedAt,
			},
		}
	})

	return c
}

export const Cat = ({
	cat,
	onCreateUpgradeJob,
	onAvatarChange,
	onNameChange,
	listUpgradeJobs,
	cancelUpgradeJob,
	deleteUpgradeJob,
	credentials,
	children,
	getThingState,
	updateDeviceConfig,
	listenForStateChange,
	catMap,
}: {
	onAvatarChange: (avatar: Blob) => void
	onNameChange: (name: string) => void
	onCreateUpgradeJob: OnCreateUpgradeJob
	listUpgradeJobs: () => Promise<DeviceUpgradeFirmwareJob[]>
	cancelUpgradeJob: (args: { jobId: string; force: boolean }) => Promise<void>
	deleteUpgradeJob: (args: {
		jobId: string
		executionNumber: number
	}) => Promise<void>
	getThingState: () => Promise<ThingState>
	updateDeviceConfig: (cfg: Partial<DeviceConfig>) => Promise<void>
	cat: CatInfo
	credentials: ICredentials
	children: React.ReactElement<any> | React.ReactElement<any>[]
	listenForStateChange: (listeners: {
		onNewState: (newState: ThingState) => void
	}) => Promise<() => void>
	catMap: (state: ThingState) => React.ReactElement<any>
}) => {
	const [state, setState] = useState<ThingState>()
	const [error, setError] = useState<Error>()
	const reported = state && state.reported
	const desired = state && state.desired

	useEffect(() => {
		let didCancel = false
		let stopListening: () => void

		const setStateIfNotCanceled = (state: ThingState) =>
			!didCancel && setState(state)
		const setErrorIfNotCanceled = (error: Error) =>
			!didCancel && setError(error)

		getThingState()
			.then(setStateIfNotCanceled)
			.catch(setErrorIfNotCanceled)

		listenForStateChange({
			onNewState: setState,
		})
			.then(s => {
				if (didCancel) {
					s()
				}
				stopListening = s
			})
			.catch(setErrorIfNotCanceled)

		return () => {
			if (stopListening) {
				console.log('Stopping listening...')
				stopListening()
			}
			didCancel = true
		}
	}, [credentials, getThingState, listenForStateChange])

	useEffect(() => {
		if (!error) {
			setTimeout(() => {
				window.requestAnimationFrame(() => {
					if (!window.localStorage.getItem('bifravst:cat:intro')) {
						intro.start()
						intro.onexit(() => {
							window.localStorage.setItem('bifravst:cat:intro', 'done')
						})
						console.log('Starting Intro.js')
					}
				})
			}, 1000)
		}
	}, [error])

	if (error)
		return (
			<Card>
				<CardBody>{error && <DisplayError error={error} />}</CardBody>
			</Card>
		)

	return (
		<CatCard>
			{state && catMap(state)}
			<CardHeader>
				<CatHeader
					cat={cat}
					isNameValid={isNameValid}
					onAvatarChange={onAvatarChange}
					onNameChange={onNameChange}
				/>
				{reported && (
					<>
						{reported.roam && (
							<Toggle>
								<ConnectionInformation
									mccmnc={reported.roam.v.mccmnc.value}
									rsrp={reported.roam.v.rsrp.value}
									receivedAt={reported.roam.v.rsrp.receivedAt}
									reportedAt={new Date(reported.roam.ts.value)}
									networkOperator={reported.dev?.v.nw.value}
								/>
							</Toggle>
						)}
						{reported.gps && reported.gps.v && (
							<Toggle>
								<div className={'info'}>
									{reported.gps.v.spd &&
										emojify(` 🏃${Math.round(reported.gps.v.spd.value)}m/s`)}
									{reported.gps.v.alt &&
										emojify(`✈️ ${Math.round(reported.gps.v.alt.value)}m`)}
									<ReportedTime
										receivedAt={reported.gps.v.lat.receivedAt}
										reportedAt={new Date(reported.gps.ts.value)}
									/>
								</div>
							</Toggle>
						)}
						{reported.bat && reported.bat.v && (
							<Toggle>
								<div className={'info'}>
									{emojify(`🔋 ${reported.bat.v.value / 1000}V`)}
									<span />
									<ReportedTime
										receivedAt={reported.bat.v.receivedAt}
										reportedAt={new Date(reported.bat.ts.value)}
									/>
								</div>
							</Toggle>
						)}
					</>
				)}
			</CardHeader>
			<CardBody>
				<Collapsable
					id={'cat:personalization'}
					title={<h3>{emojify('⭐ Personalization')}</h3>}
				>
					<CatPersonalization
						cat={cat}
						isNameValid={isNameValid}
						onAvatarChange={onAvatarChange}
						onNameChange={onNameChange}
					/>
				</Collapsable>
				{state && (
					<>
						<hr />
						<Collapsable
							id={'cat:settings'}
							title={<h3>{emojify('⚙️ Settings')}</h3>}
						>
							<Settings
								reported={
									state.reported?.cfg
										? toReportedConfig(state.reported.cfg)
										: {}
								}
								desired={state.desired?.cfg}
								onSave={config => {
									updateDeviceConfig(config)
										.catch(setError)
										.then(() => {
											setState({
												desired: {
													...(desired ? desired : {}),
													cfg: config,
												},
												reported: {
													...(reported ? reported : {}),
												},
											})
										})
										.catch(setError)
								}}
							/>
						</Collapsable>
					</>
				)}
				{reported && reported.dev && (
					<>
						<hr />
						<Collapsable
							id={'cat:information'}
							title={<h3>{emojify('ℹ️ Device Information')}</h3>}
						>
							<DeviceInfo
								key={`${cat.version}`}
								device={reported.dev}
								roaming={reported.roam}
							/>
						</Collapsable>
						<hr />
						<Collapsable
							id={'cat:fota'}
							title={<h3>{emojify('🌩️ Device Firmware Upgrade (FOTA)')}</h3>}
						>
							<FOTA
								key={`${cat.version}`}
								device={reported.dev}
								onCreateUpgradeJob={onCreateUpgradeJob}
								listUpgradeJobs={listUpgradeJobs}
								cancelUpgradeJob={cancelUpgradeJob}
								deleteUpgradeJob={deleteUpgradeJob}
							/>
						</Collapsable>
					</>
				)}
				{reported && reported.acc && reported.acc.v && (
					<>
						<hr />
						<Collapsable
							id={'cat:motion'}
							title={<h3>{emojify('🏃 Motion')}</h3>}
						>
							<AccelerometerDiagram
								values={reported.acc.v.map(
									({ value }: { value: number }) => value,
								)}
							/>
							<ReportedTime
								reportedAt={new Date(reported.acc.ts.value)}
								receivedAt={reported.acc.v[0].receivedAt}
							/>
						</Collapsable>
					</>
				)}
				<hr />
				{children}
			</CardBody>
		</CatCard>
	)
}
