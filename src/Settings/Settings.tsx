import { formatDistanceToNow } from 'date-fns'
import equal from 'fast-deep-equal'
import { default as introJs } from 'intro.js'
import { useState } from 'react'
import { Alert, Button, ButtonGroup, Form, FormGroup } from 'reactstrap'
import styled from 'styled-components'
import {
	DataModules,
	DeviceConfig,
	ReportedConfigState,
} from '../@types/device-state'
import { emojify } from '../Emojify/Emojify'
import { mobileBreakpoint } from '../Styles'
import { NumberConfigSetting } from './NumberConfigSetting'
import { OutDatedWarning } from './OutDatedWarning'

const intro = introJs()

const MAX_INT32 = 2147483647

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

	const updateConfigProperty =
		(property: string, parser?: (v: string) => number) => (value: string) => {
			updateConfig({
				[property]: parser !== undefined ? parser(value) : parseInt(value, 10),
			})
		}

	const isActive =
		newDesired.act !== undefined
			? newDesired.act === true
			: r.act?.value === true

	const [visible, setVisible] = useState(
		window.localStorage.getItem('asset-tracker:settings:help') !== 'hidden',
	)

	const onDismiss = () => {
		window.localStorage.setItem('asset-tracker:settings:help', 'hidden')
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
				<fieldset data-intro={'This sets the operation mode of the tracker.'}>
					<legend>Mode</legend>
					<FormGroup>
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
									'In <em>Passive</em> mode, the tracker will wait for movement (triggered by the accelerometer) before sending an update to the cloud.'
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
									'In <em>Active</em> mode, the tracker will send an update in a configurable interval.'
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
				<fieldset data-intro={'How long to try to acquire a GNSS fix.'}>
					<legend>GNSS Timeout</legend>
					<NumberConfigSetting
						id={'gnsst'}
						desired={newDesired.gnsst}
						reported={r.gnsst}
						example={60}
						onChange={updateConfigProperty('gnsst')}
						minimum={1}
						maximum={MAX_INT32}
					/>
				</fieldset>
				<fieldset data-intro={'This configures the <em>passive</em> mode.'}>
					<legend>Passive Mode Settings</legend>
					<SideBySide>
						<NumberConfigSetting
							label={'Movement Resolution'}
							intro={
								'After detecting movement send an update and wait this amount of time until movement again can trigger the next update.'
							}
							id={'mvres'}
							desired={newDesired.mvres}
							reported={r.mvres}
							onChange={updateConfigProperty('mvres')}
							minimum={1}
							maximum={MAX_INT32}
							example={300}
						/>
						<NumberConfigSetting
							label={'Movement Timeout'}
							intro={'Send updates to the cloud at least this often.'}
							id={'mvt'}
							example={3600}
							desired={newDesired.mvt}
							reported={r.mvt}
							onChange={updateConfigProperty('mvt')}
							minimum={1}
							maximum={MAX_INT32}
						/>
					</SideBySide>
					<NumberConfigSetting
						label={'Accelerometer threshold'}
						intro={
							'Minimal absolute value for an accelerometer reading to be considered movement. Range: 0 to 19.6133 m/s².'
						}
						id={'acct'}
						example={0.1}
						step={0.1}
						minimum={0}
						maximum={19.6133}
						unit={'m/s²'}
						desired={newDesired.acct}
						reported={r.acct}
						onChange={updateConfigProperty('acct', parseFloat)}
					/>
				</fieldset>
				<fieldset data-intro={'This configures the <em>active</em> mode.'}>
					<legend>Active Mode Settings</legend>
					<NumberConfigSetting
						label={'Active Wait Time'}
						intro={
							'Wait this amount of seconds until sending the next update. The actual interval will be this time plus the time it takes to get a GNSS fix.'
						}
						id={'actwt'}
						desired={newDesired.actwt}
						reported={r.actwt}
						onChange={updateConfigProperty('actwt')}
						minimum={1}
						maximum={MAX_INT32}
						example={60}
					/>
				</fieldset>
				<fieldset data-intro={'This sets which Data Modules to sample.'}>
					<legend>Data Sampling</legend>
					<FormGroup>
						<label>GNSS:</label>
						<ButtonGroup>
							<OutDatedWarning
								desired={newDesired.nod}
								reported={r.nod}
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
								color={'success'}
								data-intro={
									'In <em>Enabled</em> mode, the tracker will use GNSS to send location data to the cloud.'
								}
								outline={newDesired.nod?.includes(DataModules.GNSS)}
								onClick={() => {
									updateConfig({
										nod: [...(newDesired.nod ?? [])].filter(
											(s) => s !== DataModules.GNSS,
										),
									})
								}}
							>
								Enabled
							</Button>
							<Button
								color={'danger'}
								data-intro={
									'In <em>Disabled</em> mode, the tracker will not use GNSS to send location data to the cloud.'
								}
								outline={
									newDesired.nod === undefined ||
									!newDesired.nod?.includes(DataModules.GNSS)
								}
								onClick={() => {
									updateConfig({
										nod: [
											...new Set([...(newDesired.nod ?? []), DataModules.GNSS]),
										],
									})
								}}
							>
								Disabled
							</Button>
						</ButtonGroup>
					</FormGroup>
					<FormGroup>
						<label>Neighbor Cell Measurements:</label>
						<ButtonGroup>
							<OutDatedWarning
								desired={newDesired.nod}
								reported={r.nod}
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
								color={'success'}
								data-intro={
									'In <em>Enabled</em> mode, the tracker will use Neighbor Cell Measurements to send location data to the cloud.'
								}
								outline={newDesired.nod?.includes(
									DataModules.NeigboringCellMeasurements,
								)}
								onClick={() => {
									updateConfig({
										nod: [...(newDesired.nod ?? [])].filter(
											(s) => s !== DataModules.NeigboringCellMeasurements,
										),
									})
								}}
							>
								Enabled
							</Button>
							<Button
								color={'danger'}
								data-intro={
									'In <em>Disabled</em> mode, the tracker will not use Neighbor Cell Measurements to send location data to the cloud.'
								}
								outline={
									newDesired.nod === undefined ||
									!newDesired.nod?.includes(
										DataModules.NeigboringCellMeasurements,
									)
								}
								onClick={() => {
									updateConfig({
										nod: [
											...new Set([
												...(newDesired.nod ?? []),
												DataModules.NeigboringCellMeasurements,
											]),
										],
									})
								}}
							>
								Disabled
							</Button>
						</ButtonGroup>
					</FormGroup>
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
