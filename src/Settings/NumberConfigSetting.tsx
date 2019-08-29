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
import { formatDistanceToNow } from 'date-fns'

import './NumberConfigSetting.scss'
import { emojify } from '../Emojify/Emojify'

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
						onChange(value)
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
									{emojify('❓')}
								</abbr>
							</InputGroupText>
						</InputGroupAddon>
					}
					onOutDated={r => (
						<InputGroupAddon addonType="append" className={'is-outdated'}>
							<InputGroupText>
								<abbr
									title={`Device has last synced this setting ${formatDistanceToNow(
										r.receivedAt,
									)}. Current value: ${JSON.stringify(r.value)}.`}
								>
									{emojify('⭕')}
								</abbr>
							</InputGroupText>
						</InputGroupAddon>
					)}
				/>
			</InputGroup>
		</FormGroup>
	)
}
