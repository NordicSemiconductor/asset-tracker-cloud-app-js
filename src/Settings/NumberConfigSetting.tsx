import { formatDistanceToNow } from 'date-fns'
import React, { useState } from 'react'
import {
	FormGroup,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Label,
} from 'reactstrap'
import { emojify } from '../Emojify/Emojify'
import { OutDatedWarning } from './OutDatedWarning'

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
	minimum,
	maximum,
}: {
	label?: string
	intro?: string
	unit?: string
	example?: number
	step?: number
	id: 'actwt' | 'mvres' | 'mvt' | 'gnsst' | 'acct'
	onChange: (v: string) => any
	desired?: number
	reported?: {
		value: number
		receivedAt: Date
	}
	minimum?: number
	maximum?: number
}) => {
	const [input, updateInput] = useState(`${desired ?? reported?.value}`)
	const minValue = minimum ?? 0
	const maxValue = maximum ?? Number.MAX_SAFE_INTEGER
	return (
		<FormGroup data-intro={intro} className={'number-config-setting'}>
			{label !== undefined && <Label for={id}>{label}:</Label>}
			<InputGroup>
				<OutDatedWarning
					desired={desired}
					reported={reported}
					onNotReported={
						<InputGroupAddon addonType="prepend" className={'is-outdated'}>
							<InputGroupText className={'text-danger'}>
								<abbr title={'Device has not reported this setting, yet.'}>
									{emojify('❓')}
								</abbr>
							</InputGroupText>
						</InputGroupAddon>
					}
					onOutDated={(r) => (
						<InputGroupAddon addonType="prepend" className={'is-outdated'}>
							<InputGroupText className={'text-danger'}>
								<abbr
									title={`Device has last synced this setting ${formatDistanceToNow(
										r.receivedAt,
									)} ago. Current value: ${JSON.stringify(r.value)}.`}
								>
									{emojify('⭕')}
								</abbr>
							</InputGroupText>
						</InputGroupAddon>
					)}
				/>
				<Input
					type="number"
					name={id}
					id={id}
					placeholder={`e.g. "${example ?? 60}"`}
					step={step}
					min={minValue}
					max={maxValue}
					value={input}
					onChange={({ target: { value } }) => {
						if (parseInt(value) < minValue) value = `${minValue}`
						if (parseInt(value) > maxValue) value = `${maxValue}`
						updateInput(value)
						onChange(value)
					}}
				/>
				<InputGroupAddon addonType="append">
					<InputGroupText>{unit ?? 's'}</InputGroupText>
				</InputGroupAddon>
			</InputGroup>
		</FormGroup>
	)
}
