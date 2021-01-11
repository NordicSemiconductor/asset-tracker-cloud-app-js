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
	minimum,
	maximum,
}: {
	label?: string
	intro?: string
	unit?: string
	example?: number
	step?: number
	id: 'actwt' | 'mvres' | 'mvt' | 'gpst' | 'acct' | 'celt'
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
					min={minimum ?? 0}
					max={maximum ?? Number.MAX_SAFE_INTEGER}
					value={input}
					onChange={({ target: { value } }) => {
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
