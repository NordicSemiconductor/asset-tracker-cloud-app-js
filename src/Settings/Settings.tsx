import React, { useState } from 'react'
import { Button, ButtonGroup, Form, FormGroup, Alert } from 'reactstrap'
import equal from 'fast-deep-equal'
import { OutDatedWarning } from './OutDatedWarning'
import { NumberConfigSetting } from './NumberConfigSetting'
import { formatDistanceToNow } from 'date-fns'
import { emojify } from '../Emojify/Emojify'
import styled from 'styled-components'
import { mobileBreakpoint } from '../Styles'
import { DeviceConfig, ReportedConfigState } from '../@types/device-state'
import { default as introJs } from 'intro.js'

const intro = introJs()

const SettingsForm = styled(Form)`
	@media (min-width: ${mobileBreakpoint}) {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto;
		grid-column-gap: 1rem;
	}

	input,
	span.input-group-text,
	label,
	legend,
	button {
		font-size: 80%;
		@media (min-width: ${mobileBreakpoint}) {
			font-size: 100%;
		}
	}

	fieldset {
		@media (min-width: ${mobileBreakpoint}) {
			border-radius: 5px;
			border: 1px solid #cccccc;
			padding: 0.5rem 1rem 0 1rem;
			margin-bottom: 1rem;
		}
		legend {
			width: auto;
			margin: 0;
		}
	}
	.btn-group {
		width: 100%;
	}
	label {
		font-weight: normal;
	}
`

const SideBySide = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-column-gap: 1rem;
	align-items: baseline;
	@media (min-width: ${mobileBreakpoint}) {
		display: block;
	}
`

const Help = styled.p`
	display: flex;
	font-style: italic;
	font-size: 90%;
	button {
		font-size: inherit;
		padding: 0 0.25rem;
	}
	align-items: center;
`

export const FooterWithFullWidthButton = styled.footer`
	grid-column: auto / span 2;
	display: flex;
	flex-direction: column;
`

export const Settings = ({
	onSave,
	reported,
	desired,
}: {
	reported?: ReportedConfigState
	desired?: Partial<DeviceConfig>
	onSave: (config: Partial<DeviceConfig>) => void
}) => {
	const r: ReportedConfigState = reported ?? {}

	const [newDesired, setNewDesired] = useState<Partial<DeviceConfig>>(
		desired ?? {},
	)

	const hasInitial = desired === undefined
	const [changed, setChanged] = useState(hasInitial)

	const updateConfig = (cfg: Partial<DeviceConfig>) => {
		const updated = {
			...newDesired,
			...cfg,
		}
		setNewDesired(updated)
		if (!hasInitial) {
			setChanged(!equal(updated, desired))
		}
	}

	const updateConfigProperty = (
		property: string,
		parser?: (v: string) => number,
	) => (value: string) => {
		updateConfig({
			[property]: parser !== undefined ? parser(value) : parseInt(value, 10),
		})
	}

	const isActive =
		newDesired.act !== undefined
			? newDesired.act === true
			: r.act?.value === true

	const [visible, setVisible] = useState(
		window.localStorage.getItem('bifravst:settings:help') !== 'hidden',
	)

	const onDismiss = () => {
		window.localStorage.setItem('bifravst:settings:help', 'hidden')
		setVisible(false)
	}
	return (
		<>
			<Alert color={'info'} isOpen={visible} toggle={onDismiss}>
				<Help>
					Click{' '}
					<Button
						color={'link'}
						onClick={() => {
							window.requestAnimationFrame(() => {
								intro.start()
							})
						}}
					>
						{emojify('💁')} Help
					</Button>{' '}
					to view detailed description of the settings.
				</Help>
			</Alert>
			<SettingsForm>
				<fieldset>
					<legend>Mode</legend>
					<FormGroup
						data-intro={'This sets the operation mode of the Tracker.'}
					>
						<ButtonGroup>
							<OutDatedWarning
								desired={newDesired.act}
								reported={r.act}
								onNotReported={
									<Button
										color={'danger'}
										disabled={true}
										title={'Device has not reported this setting, yet.'}
									>
										{emojify('❓')}
									</Button>
								}
								onOutDated={(r) => (
									<Button
										color={'danger'}
										outline={true}
										disabled={true}
										title={`Device has last synced this setting ${formatDistanceToNow(
											r.receivedAt,
										)} ago. Current value: ${JSON.stringify(r.value)}.`}
									>
										{emojify('⭕')}
									</Button>
								)}
							/>
							<Button
								color={'info'}
								data-intro={
									'In <em>passive</em> mode only if it detects movement.'
								}
								outline={isActive}
								onClick={() => {
									updateConfig({ act: false })
								}}
							>
								Passive
							</Button>
							<Button
								color={'success'}
								data-intro={
									'In <em>active</em> mode the tracker will continuously send updates.'
								}
								outline={!isActive}
								onClick={() => {
									updateConfig({ act: true })
								}}
							>
								Active
							</Button>
						</ButtonGroup>
					</FormGroup>
				</fieldset>
				<fieldset>
					<legend>Active Mode Settings</legend>
					<NumberConfigSetting
						label={'Active Wait Time'}
						intro={
							'In <em>active</em> mode: wait this long until sending the next update. The actual interval will be this time plus the time it takes to get a GPS fix.'
						}
						id={'actwt'}
						desired={newDesired.actwt}
						reported={r.actwt}
						onChange={updateConfigProperty('actwt')}
					/>
				</fieldset>
				<fieldset>
					<legend>Passive Mode Settings</legend>
					<SideBySide>
						<NumberConfigSetting
							label={'Movement Resolution'}
							intro={
								'In <em>passive</em> mode: Time to wait after detecting movement before sending the next update'
							}
							id={'mvres'}
							desired={newDesired.mvres}
							reported={r.mvres}
							onChange={updateConfigProperty('mvres')}
						/>
						<NumberConfigSetting
							label={'Movement Timeout'}
							intro={
								'In <em>passive</em> mode: Send update at least this often'
							}
							id={'mvt'}
							example={3600}
							desired={newDesired.mvt}
							reported={r.mvt}
							onChange={updateConfigProperty('mvt')}
						/>
					</SideBySide>
					<NumberConfigSetting
						label={'Accelerometer threshold'}
						intro={
							'Accelerometer threshold: minimal absolute value for and accelerometer reading to be considered movement.'
						}
						id={'acct'}
						example={2.5}
						step={0.1}
						unit={'m/s²'}
						desired={
							newDesired.acct === undefined ? undefined : newDesired.acct / 10
						}
						reported={
							r.acct && {
								...r.acct,
								value: r.acct.value / 10,
							}
						}
						onChange={updateConfigProperty('acct', (v) =>
							Math.round(parseFloat(v) * 10),
						)}
					/>
				</fieldset>
				<fieldset>
					<legend>Timeouts</legend>
					<SideBySide>
						<NumberConfigSetting
							id={'gpst'}
							label={'GPS Timeout'}
							intro={'Timeout for GPS fix'}
							desired={newDesired.gpst}
							reported={r.gpst}
							example={180}
							onChange={updateConfigProperty('gpst')}
						/>
						{/*
					FIXME: enable once https://github.com/bifravst/cat-tracker-fw/issues/25 is implemented
					<NumberConfigSetting
						id={'celt'}
						label={'Cellular Timeout'}
						intro={'Timeout for cellular establishing the connection'}
						desired={newDesired.celt}
						reported={r.celt}
						example={600}
						onChange={updateConfigProperty('celt')}
					/>
					*/}
					</SideBySide>
				</fieldset>
				<FooterWithFullWidthButton>
					<Button
						color={'primary'}
						disabled={!changed}
						onClick={() => {
							onSave(newDesired)
						}}
					>
						Update
					</Button>
				</FooterWithFullWidthButton>
			</SettingsForm>
		</>
	)
}
