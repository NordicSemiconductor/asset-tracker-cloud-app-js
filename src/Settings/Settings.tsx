import React, { useState } from 'react'
import { Button, ButtonGroup, Form, FormGroup } from 'reactstrap'
import equal from 'fast-deep-equal'
import { DeviceConfig } from '../@types/DeviceShadow'
import { OutDatedWarning } from './OutDatedWarning'
import { NumberConfigSetting } from './NumberConfigSetting'
import { formatDistanceToNow } from 'date-fns'
import { emojify } from '../Emojify/Emojify'
import styled from 'styled-components'
import { mobileBreakpoint } from '../Styles'

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
		.sidebyside {
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-column-gap: 1rem;
			align-items: baseline;
			@media (min-width: ${mobileBreakpoint}) {
				display: block;
			}
		}
	}
	.btn-group {
		width: 100%;
	}
	label {
		font-weight: normal;
	}
`

export const FooterWithFullWidthButton = styled.footer`
	grid-column: auto / span 2;
	display: flex;
	flex-direction: column;
`

export type DesiredConfig = {
	act: boolean
	actwt: number
	mvres: number
	mvt: number
	gpst: number
	acct: number
}

export const Settings = ({
	onSave,
	desired,
	reported,
}: {
	desired?: Partial<DesiredConfig>
	reported?: DeviceConfig
	onSave: (config: Partial<DesiredConfig>) => void
}) => {
	const [newDesired, setNewDesired] = useState<Partial<DesiredConfig>>(
		desired || {},
	)
	const hasInitial = desired === undefined
	const [changed, setChanged] = useState(hasInitial)
	const [saving, setSaving] = useState(false)

	const updateConfig = (cfg: Partial<DesiredConfig>) => {
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
		updateConfig({ [property]: parser ? parser(value) : parseInt(value, 10) })
	}

	const r: Partial<DeviceConfig> = reported || {}

	return (
		<SettingsForm>
			<fieldset>
				<legend>Mode</legend>
				<FormGroup data-intro={'This sets the operation mode of the Tracker.'}>
					<ButtonGroup>
						<Button
							color={'info'}
							data-intro={
								'In <em>active</em> mode the tracker will continuously send updates.'
							}
							outline={newDesired.act === undefined || newDesired.act}
							onClick={() => {
								updateConfig({ act: false })
							}}
						>
							Passive
						</Button>
						<Button
							color={'success'}
							data-intro={
								'In <em>passive</em> mode only if it detects movement.'
							}
							outline={newDesired.act === undefined || !newDesired.act}
							onClick={() => {
								updateConfig({ act: true })
							}}
						>
							Active
						</Button>
						<OutDatedWarning
							desired={newDesired.act}
							reported={r.act}
							onNotReported={
								<Button
									color={'danger'}
									outline={true}
									disabled={true}
									title={'Device has not reported this setting, yet.'}
								>
									{emojify('❓')}
								</Button>
							}
							onOutDated={r => (
								<Button
									color={'danger'}
									outline={true}
									disabled={true}
									title={`Device has last synced this setting ${formatDistanceToNow(
										r.receivedAt,
									)}. Current value: ${JSON.stringify(r.value)}.`}
								>
									{emojify('⭕')}
								</Button>
							)}
						/>
					</ButtonGroup>
				</FormGroup>
			</fieldset>
			<fieldset data-intro={'Timeout for GPS fix'}>
				<legend>GPS Timeout</legend>
				<NumberConfigSetting
					id={'gpst'}
					desired={newDesired.gpst}
					reported={r.gpst}
					example={180}
					onChange={updateConfigProperty('gpst')}
				/>
			</fieldset>
			<fieldset>
				<legend>Passive Mode Settings</legend>
				<div className={'sidebyside'}>
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
						intro={'In <em>passive</em> mode: Send update at least this often'}
						id={'mvt'}
						example={3600}
						desired={newDesired.mvt}
						reported={r.mvt}
						onChange={updateConfigProperty('mvt')}
					/>
				</div>
				<NumberConfigSetting
					label={'Accelerometer threshold'}
					intro={
						'Accelerometer threshold: minimal absolute value for and accelerometer reading to be considered movement.'
					}
					id={'acct'}
					example={2.5}
					step={0.1}
					unit={'m/s²'}
					desired={newDesired.acct ? newDesired.acct / 10 : undefined}
					reported={
						r.acct && {
							...r.acct,
							value: r.acct.value / 10,
						}
					}
					onChange={updateConfigProperty('acct', v =>
						Math.round(parseFloat(v) * 10),
					)}
				/>
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
			<FooterWithFullWidthButton>
				<Button
					color={'primary'}
					disabled={!changed || saving}
					onClick={() => {
						setSaving(true)
						onSave(newDesired)
					}}
				>
					{saving && 'Saving ...'}
					{!saving && 'Save'}
				</Button>
			</FooterWithFullWidthButton>
		</SettingsForm>
	)
}
