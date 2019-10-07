import { hideOnDesktop, mobileBreakpoint } from '../Styles'
import { AvatarPicker } from '../Avatar/AvatarPicker'
import styled from 'styled-components'
import * as introJs from 'intro.js'
import { FOTA, OnCreateUpgradeJob } from '../FOTA/FOTA'
import { DeviceUpgradeFirmwareJob } from '../aws/listUpgradeFirmwareJobs'
import { AWSIotThingState } from '../aws/connectAndListenForStateChange'
import { DesiredConfig, Settings } from '../Settings/Settings'
import { ICredentials } from '@aws-amplify/core'
import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { Error } from '../Error/Error'
import { Editable } from '../Editable/Editable'
import { Toggle } from '../Toggle/Toggle'
import { ConnectionInformation } from './ConnectionInformation'
import { emojify } from '../Emojify/Emojify'
import { ReportedTime } from './ReportedTime'
import { Collapsable } from '../Collapsable/Collapsable'
import { DeviceInfo } from './DeviceInformation'
import { AccelerometerDiagram } from '../AccelerometerDiagram/AccelerometerDiagram'
import { CatInfo } from './aws/CatLoader'

const intro = introJs()
const MobileOnlyAvatarPicker = hideOnDesktop(AvatarPicker)
const MobileOnlyH2 = hideOnDesktop(styled.h2``)
const CatCard = styled(Card)`
	img.avatar {
		width: 75px;
		border-radius: 100%;
		border: 2px solid #000000b5;
		box-shadow: 0 2px 4px #00000057;
		background-color: #fff;
	}

	.card-header {
		position: relative;
		text-align: center;
		img.avatar {
			position: absolute;
			top: 0;
			left: 50%;
			margin-left: -38.5px;
			margin-top: -53.5px;
			z-index: 9000;
		}
		h2 {
			margin: 10px;
		}
		div.info {
			text-align: left;
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			@media (min-width: ${mobileBreakpoint}) {
				display: grid;
				grid-template: auto / 1fr 1fr 2fr;
			}
			font-size: 85%;
			opacity: 0.75;
			span.reportedTime {
				font-size: 85%;
				opacity: 0.75;
				text-align: right;
				span.textWithIcon {
					width: auto;
					display: inline-block;
				}
			}
			padding-top: 0.5rem;
		}
		div.toggle + div.toggle {
			margin-top: 0.5rem;
			border-top: 1px solid #dcdcdc;
		}
		@media (max-width: ${mobileBreakpoint}) {
			div.info {
				.reportedTime {
					time {
						display: none;
					}
				}
			}
			.toggle.toggle-on {
				div.info {
					.reportedTime {
						time {
							display: inline;
						}
					}
				}
			}
		}
	}
	.card-body {
		h3 {
			font-size: 100%;
			@media (min-width: ${mobileBreakpoint}) {
				font-size: 115%;
			}
			margin: 0;
		}
		h4 {
			font-size: 105%;
		}
		.collapsable {
			&.personalization {
				.content {
					display: flex;
					justify-content: space-between;
				}
			}
		}
	}
`
export const Cat = ({
	cat,
	onCreateUpgradeJob,
	onAvatarChange,
	onNameChange,
	listUpgradeJobs,
	cancelUpgradeJob,
	deleteUpgradeJob,
	identityId,
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
	getThingState: () => Promise<AWSIotThingState>
	updateDeviceConfig: (cfg: Partial<DesiredConfig>) => Promise<void>
	cat: CatInfo
	identityId: string
	credentials: ICredentials
	children: React.ReactElement<any> | React.ReactElement<any>[]
	listenForStateChange: (
		onNewState: (newState: AWSIotThingState) => void,
	) => Promise<() => void>
	catMap: (state: AWSIotThingState) => React.ReactElement<any>
}) => {
	const [state, setState] = useState<AWSIotThingState>()
	const [error, setError] = useState()
	const reported = state && state.reported
	const desired = state && state.desired

	useEffect(() => {
		let didCancel = false
		let stopListening: () => void

		const setStateIfNotCanceled = (state: AWSIotThingState) =>
			!didCancel && setState(state)
		const setErrorIfNotCanceled = (error: Error) =>
			!didCancel && setError(error)

		getThingState()
			.then(setStateIfNotCanceled)
			.catch(setErrorIfNotCanceled)

		listenForStateChange(setState)
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
	}, [identityId, credentials, getThingState, listenForStateChange])

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
				<CardBody>{error && <Error error={error} />}</CardBody>
			</Card>
		)

	const isCatNameValid = (name: string): boolean =>
		/^[0-9a-z_.,@/:#-]{1,800}$/i.test(name)

	return (
		<CatCard>
			{state && catMap(state)}
			<CardHeader>
				<MobileOnlyAvatarPicker
					key={`${cat.version}`}
					onChange={onAvatarChange}
				>
					<img src={cat.avatar} alt={cat.name} className={'avatar'} />
				</MobileOnlyAvatarPicker>
				<MobileOnlyH2>
					<Editable
						key={`${cat.version}`}
						text={cat.name}
						onChange={onNameChange}
						isValid={isCatNameValid}
					/>
				</MobileOnlyH2>
				{reported && (
					<>
						{reported.dev && reported.roam && (
							<Toggle>
								<ConnectionInformation
									device={reported.dev}
									roaming={reported.roam}
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
					<dl>
						<dt>Name</dt>
						<dd data-intro="Click here to edit the name of your cat.">
							<Editable
								key={`${cat.version}`}
								text={cat.name}
								onChange={onNameChange}
								isValid={isCatNameValid}
							/>
						</dd>
					</dl>
					<AvatarPicker key={`${cat.version}`} onChange={onAvatarChange}>
						<img
							src={cat.avatar}
							alt={cat.name}
							className={'avatar'}
							data-intro="Click here to upload a new image for your cat."
						/>
					</AvatarPicker>
				</Collapsable>
				{state && (
					<>
						<hr />
						<Collapsable
							id={'cat:settings'}
							title={<h3>{emojify('⚙️ Settings')}</h3>}
						>
							<Settings
								state={state}
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
