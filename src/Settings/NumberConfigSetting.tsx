import React, { useState } from 'react'
import {
	FormGroup,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Label,
} from 'reactstrap'
import { OutDatedWarning } from './OutDatedWarning'
import {
	CloudOff as NotReportedIcon,
	SyncProblem as OutdatedIcon,
} from '@material-ui/icons'
import { distanceInWords } from 'date-fns'

import './NumberConfigSetting.scss'

export const NumberConfigSetting = ({
	label,
	intro,
	id,
	unit,
	example,
	step,
	onChange,
	desired,
	reported,
}: {
	label?: string
	intro?: string
	unit?: string
	example?: number
	step?: number
	id: 'actwt' | 'mvres' | 'mvt' | 'gpst' | 'acct'
	onChange: (v: string) => any
	desired?: number
	reported?: {
		value: number
		receivedAt: Date
	}
}) => {
	const [input, updateInput] = useState(desired ? `${desired}` : '')
	return (
		<FormGroup data-intro={intro} className={'number-config-setting'}>
			{label && <Label for={id}>{label}:</Label>}
			<InputGroup>
				<Input
					type="number"
					name={id}
					id={id}
					placeholder={`e.g. "${example || 60}"`}
					step={step || step}
					min={0}
					value={input}
					onChange={({ target: { value } }) => {
						updateInput(value)
					}}
					onBlur={() => {
						onChange(input)
					}}
				/>
				<InputGroupAddon addonType="append">
					<InputGroupText>{unit || 's'}</InputGroupText>
				</InputGroupAddon>
				<OutDatedWarning
					desired={desired}
					reported={reported}
					onNotReported={
						<InputGroupAddon addonType="append" className={'is-outdated'}>
							<InputGroupText>
								<abbr title={'Device has not reported this setting, yet.'}>
									<NotReportedIcon />
								</abbr>
							</InputGroupText>
						</InputGroupAddon>
					}
					onOutDated={r => (
						<InputGroupAddon addonType="append" className={'is-outdated'}>
							<InputGroupText>
								<abbr
									title={`Device has last synced this setting ${distanceInWords(
										new Date(),
										r.receivedAt,
									)} ago. Current value: ${JSON.stringify(r.value)}.`}
								>
									<OutdatedIcon />
								</abbr>
							</InputGroupText>
						</InputGroupAddon>
					)}
				/>
			</InputGroup>
		</FormGroup>
	)
}
