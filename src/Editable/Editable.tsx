import React, { useState } from 'react'
import classNames from 'classnames'

import './Editable.scss'

export const Editable = ({
	text: originalText,
	onChange,
}: {
	text: string
	onChange: (updatedText: string) => void
}) => {
	const [editing, setEditing] = useState(false)
	const [input, updateInput] = useState(originalText)
	const [text, updateText] = useState(originalText)
	if (editing) {
		return (
			<input
				className={classNames('editable', { error: !input.length })}
				type="text"
				value={input}
				autoFocus
				onBlur={() => {
					if (!input.length) {
						return
					}
					setEditing(false)
					if (input !== text) {
						updateText(input)
						onChange(input)
					}
				}}
				onChange={({ target: { value } }) => {
					updateInput(value)
				}}
			/>
		)
	}
	return (
		<span
			onClick={() => {
				setEditing(true)
			}}
		>
			{text}
		</span>
	)
}
