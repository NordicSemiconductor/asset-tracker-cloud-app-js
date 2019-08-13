import React, { useState } from 'react'
import {
	Button,
	ButtonGroup,
	Form,
	FormGroup,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Label,
	Alert,
} from 'reactstrap'
import equal from 'fast-deep-equal'
import { distanceInWords } from 'date-fns'
import { SignalCellularConnectedNoInternet0BarRounded as OutdatedIcon } from '@material-ui/icons'

import './Settings.scss'
import { Config } from '../DeviceShadow'

export type DesiredConfig = {
	act: boolean
	actwt: number
	mvres: number
	mvt: number
	gpst: number
	acct: number
}

const defaultConfig: DesiredConfig = {
	act: false, // Whether to enable the active mode
	actwt: 60, //In active mode: wait this amount of seconds until sending the next update. The actual interval will be this time plus the time it takes to get a GPS fix.
	mvres: 300, // (movement resolution) In passive mode: Time in seconds to wait after detecting movement before sending the next update
	mvt: 3600, // (movement timeout) In passive mode: Send update at least this often (in seconds)
	gpst: 180, // GPS timeout (in seconds): timeout for GPS fix
	acct: 10, // Accelerometer threshold: minimal absolute value for and accelerometer reading to be considered movement.
} as const

const OutDatedWarning = ({
	desired,
	reported,
	current,
}: {
	current?: boolean | number
	desired?: boolean | number
	reported?: {
		value: boolean | number
		receivedAt: string
	}
}) => {
	const reportedDoesNotMatchDesired = reported && desired === reported.value
	const noDesiredValueButCurrentValueDoesNotMatchReported =
		!desired && reported && reported.value === current
	if (
		noDesiredValueButCurrentValueDoesNotMatchReported ||
		reportedDoesNotMatchDesired
	) {
		return null
	}
	if (reported) {
		return (
			<div className={'outDated'}>
				<OutdatedIcon />
				<p>
					<code>{JSON.stringify(reported.value)}</code> (
					<time dateTime={reported.receivedAt}>
						{distanceInWords(new Date(), reported.receivedAt)} ago
					</time>{' '}
					)
				</p>
			</div>
		)
	}
	return (
		<Alert color={'danger'}>Device has not reported this setting, yet.</Alert>
	)
}

export const Settings = ({
	onSave,
	desired,
	reported,
}: {
	desired?: DesiredConfig
	reported?: Config
	onSave: (config: DesiredConfig) => void
}) => {
	let initial = defaultConfig
	let hasCurrent = false
	if (desired) {
		initial = {
			...defaultConfig,
			...{
				...desired,
				...(desired.acct && {
					acct: desired.acct / 10,
				}),
			},
		}
		hasCurrent = true
	}
	const [config, setConfig] = useState(initial)
	const [changed, setChanged] = useState(!hasCurrent)
	const [saving, setSaving] = useState(false)
	const [input, updateInput] = useState({
		actwt: `${initial.actwt}`,
		mvres: `${initial.mvres}`,
		mvt: `${initial.mvt}`,
		gpst: `${initial.gpst}`,
		acct: `${initial.acct}`,
	})

	const updateAllInputs = () => {
		updateInput({
			actwt: `${config.actwt}`,
			mvres: `${config.mvres}`,
			mvt: `${config.mvt}`,
			gpst: `${config.gpst}`,
			acct: `${config.acct / 10}`,
		})
	}

	const updateConfig = (cfg: Partial<DesiredConfig>) => {
		const updated = {
			...config,
			...cfg,
		}
		setConfig(updated)
		if (hasCurrent) {
			setChanged(!equal(updated, initial))
		}
	}

	const d: Partial<DesiredConfig> = desired || {}
	const r: Partial<Config> = reported || {}

	return (
		<Form className={'settings'}>
			<fieldset>
				<legend>Mode</legend>
				<FormGroup data-intro={'This sets the operation mode of the Tracker.'}>
					<ButtonGroup>
						<Button
							color={'info'}
							data-intro={
								'In <em>active</em> mode the tracker will continuously send updates.'
							}
							outline={config.act}
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
							outline={!config.act}
							onClick={() => {
								updateConfig({ act: true })
							}}
						>
							Active
						</Button>
					</ButtonGroup>
					<OutDatedWarning
						current={config.act}
						desired={d.act}
						reported={r.act}
					/>
				</FormGroup>
			</fieldset>
			<fieldset data-intro={'Timeout for GPS fix'}>
				<legend>GPS Timeout</legend>
				<FormGroup>
					<InputGroup>
						<Input
							type="number"
							name="gpst"
							id="gpst"
							placeholder='e.g. "60"'
							step={1}
							min={0}
							value={input.gpst}
							onChange={({ target: { value } }) => {
								updateInput({
									...input,
									gpst: value,
								})
								updateConfig({ gpst: value ? parseInt(value, 10) : 0 })
							}}
							onBlur={updateAllInputs}
						/>
						<InputGroupAddon addonType="append">
							<InputGroupText>seconds</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<OutDatedWarning
						current={config.gpst}
						desired={d.gpst}
						reported={r.gpst}
					/>
				</FormGroup>
			</fieldset>
			<fieldset>
				<legend>Passive Mode Settings</legend>
				<FormGroup
					data-intro={
						'In <em>passive</em> mode: Time to wait after detecting movement before sending the next update'
					}
				>
					<Label for="mvres">Movement Resolution:</Label>
					<InputGroup>
						<Input
							type="number"
							name="mvres"
							id="mvres"
							placeholder='e.g. "60"'
							step={1}
							min={0}
							value={input.mvres}
							onChange={({ target: { value } }) => {
								updateInput({
									...input,
									mvres: value,
								})
								updateConfig({
									mvres: value ? parseInt(value, 10) : 0,
								})
							}}
							onBlur={updateAllInputs}
						/>
						<InputGroupAddon addonType="append">
							<InputGroupText>seconds</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<OutDatedWarning
						current={config.mvres}
						desired={d.mvres}
						reported={r.mvres}
					/>
				</FormGroup>
				<FormGroup
					data-intro={
						'In <em>passive</em> mode: Send update at least this often'
					}
				>
					<Label for="mvt">Movement Timeout:</Label>
					<InputGroup>
						<Input
							type="number"
							name="mvt"
							id="mvt"
							placeholder='e.g. "3600"'
							step={1}
							min={0}
							value={input.mvt}
							onChange={({ target: { value } }) => {
								updateInput({
									...input,
									mvt: value,
								})
								updateConfig({
									mvt: value ? parseInt(value, 10) : 0,
								})
							}}
							onBlur={updateAllInputs}
						/>
						<InputGroupAddon addonType="append">
							<InputGroupText>seconds</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<OutDatedWarning
						current={config.mvt}
						desired={d.mvt}
						reported={r.mvt}
					/>
				</FormGroup>
				<FormGroup
					data-intro={
						'Accelerometer threshold: minimal absolute value for and accelerometer reading to be considered movement.'
					}
				>
					<Label for="acct">Accelerometer threshold:</Label>
					<InputGroup>
						<Input
							type="number"
							name="acct"
							id="acct"
							placeholder='e.g. "1"'
							step={0.1}
							min={0}
							value={input.acct}
							onChange={({ target: { value } }) => {
								updateInput({
									...input,
									acct: value,
								})
								updateConfig({
									acct: value ? Math.round(parseInt(value, 10) * 10) : 0,
								})
							}}
							onBlur={updateAllInputs}
						/>
						<InputGroupAddon addonType="append">
							<InputGroupText>absolute value</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<OutDatedWarning
						current={config.acct}
						desired={d.acct && d.acct / 10}
						reported={
							r.acct && {
								...r.acct,
								value: r.acct.value / 10,
							}
						}
					/>
				</FormGroup>
			</fieldset>
			<fieldset>
				<legend>Active Mode Settings</legend>
				<FormGroup
					data-intro={
						'In <em>active</em> mode: wait this long until sending the next update. The actual interval will be this time plus the time it takes to get a GPS fix.'
					}
				>
					<Label for="actwt">Active Wait Time:</Label>
					<InputGroup>
						<Input
							type="number"
							name="actwt"
							id="actwt"
							placeholder='e.g. "60"'
							step={1}
							min={0}
							value={input.actwt}
							onChange={({ target: { value } }) => {
								updateInput({
									...input,
									actwt: value,
								})
								updateConfig({
									actwt: value ? parseInt(value, 10) : 0,
								})
							}}
							onBlur={updateAllInputs}
						/>
						<InputGroupAddon addonType="append">
							<InputGroupText>seconds</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<OutDatedWarning
						current={config.actwt}
						desired={d.actwt}
						reported={r.actwt}
					/>
				</FormGroup>
			</fieldset>
			<footer>
				<Button
					color={'primary'}
					disabled={!changed || saving}
					onClick={() => {
						setSaving(true)
						onSave(config)
					}}
				>
					{saving && 'Saving ...'}
					{!saving && 'Save'}
				</Button>
			</footer>
		</Form>
	)
}
