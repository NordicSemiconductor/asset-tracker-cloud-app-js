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

export type DesiredConfig = {
	act: boolean
	actwt: number
	mvres: number
	mvt: number
	gpst: number
	acct: number
}

export type ReportedConfig = {
	act: {
		value: boolean
		receivedAt: string
	}
	actwt: {
		value: number
		receivedAt: string
	}
	mvres: {
		value: number
		receivedAt: string
	}
	mvt: {
		value: number
		receivedAt: string
	}
	gpst: {
		value: number
		receivedAt: string
	}
	acct: {
		value: number
		receivedAt: string
	}
}

const defaultConfig: DesiredConfig = {
	act: false, // Whether to enable the active mode
	actwt: 60, //In active mode: wait this amount of seconds until sending the next update. The actual interval will be this time plus the time it takes to get a GPS fix.
	mvres: 300, // (movement resolution) In passive mode: Time in seconds to wait after detecting movement before sending the next update
	mvt: 3600, // (movement timeout) In passive mode: Send update at least this often (in seconds)
	gpst: 60, // GPS timeout (in seconds): timeout for GPS fix
	acct: 1, // Accelerometer threshold: minimal absolute value for and accelerometer reading to be considered movement.
} as const

const OutDatedWarning = ({
	desired,
	reported,
}: {
	desired?: boolean | number
	reported?: {
		value: boolean | number
		receivedAt: string
	}
}) => {
	if (reported && desired === reported.value) {
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
	reported?: ReportedConfig
	onSave: (config: DesiredConfig) => void
}) => {
	let initial = defaultConfig
	let hasCurrent = false
	if (desired) {
		initial = desired
		hasCurrent = true
	}
	const [config, setConfig] = useState(initial)
	const [changed, setChanged] = useState(!hasCurrent)

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
	const r: Partial<ReportedConfig> = reported || {}

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
					<OutDatedWarning desired={d.act} reported={r.act} />
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
							step={60}
							min={1}
							value={config.gpst}
							onChange={({ target: { value } }) => {
								if (value) {
									const s = parseInt(value, 10)
									updateConfig({ gpst: s })
								}
							}}
						/>
						<InputGroupAddon addonType="append">
							<InputGroupText>seconds</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<OutDatedWarning desired={d.gpst} reported={r.gpst} />
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
							step={60}
							min={1}
							value={config.mvres}
							onChange={({ target: { value } }) => {
								if (value) {
									const s = parseInt(value, 10)
									updateConfig({
										mvres: s,
									})
								}

							}}
						/>
						<InputGroupAddon addonType="append">
							<InputGroupText>seconds</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<OutDatedWarning desired={d.mvres} reported={r.mvres} />
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
							step={60}
							min={1}
							value={config.mvt}
							onChange={({ target: { value } }) => {
								if (value) {
									const s = parseInt(value, 10)
									updateConfig({
										mvt: s,
									})
								}
							}}
						/>
						<InputGroupAddon addonType="append">
							<InputGroupText>seconds</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<OutDatedWarning desired={d.mvt} reported={r.mvt} />
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
							value={config.acct / 10}
							onChange={({ target: { value } }) => {
								if (value) {
									const s = parseFloat(value)
									updateConfig({
										acct: Math.round(s * 10),
									})
								}
							}}
						/>
						<InputGroupAddon addonType="append">
							<InputGroupText>absolute value</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<OutDatedWarning desired={d.acct} reported={r.acct} />
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
							step={60}
							min={1}
							value={config.actwt}
							onChange={({ target: { value } }) => {
								if (value) {
									const s = parseInt(value, 10)
									updateConfig({
										actwt: s,
									})
								}
							}}
						/>
						<InputGroupAddon addonType="append">
							<InputGroupText>seconds</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					<OutDatedWarning desired={d.actwt} reported={r.actwt} />
				</FormGroup>
			</fieldset>
			<footer>
				<Button
					color={'primary'}
					disabled={!changed}
					onClick={() => {
						onSave(config)
					}}
				>
					Save
				</Button>
			</footer>
		</Form>
	)
}
