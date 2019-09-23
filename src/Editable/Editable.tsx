import React, { useState } from 'react'
import styled from 'styled-components'

const EditableInput = styled.input`
	width: 100%;
	@keyframes shake {
		10%,
		90% {
			transform: translate3d(-1px, 0, 0);
		}

		20%,
		80% {
			transform: translate3d(2px, 0, 0);
		}

		30%,
		50%,
		70% {
			transform: translate3d(-4px, 0, 0);
		}

		40%,
		60% {
			transform: translate3d(4px, 0, 0);
		}
	}
`
const EditableInputWithError = styled(EditableInput)`
	animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	transform: translate3d(0, 0, 0);
	backface-visibility: hidden;
	perspective: 1000px;
	border-color: red;
`

export const Editable = ({
	text: originalText,
	onChange,
	isValid,
}: {
	text: string
	onChange: (updatedText: string) => void
	isValid: (text: string) => boolean
}) => {
	const [editing, setEditing] = useState(false)
	const [input, updateInput] = useState(originalText)
	const [text, updateText] = useState(originalText)

	const Input = !isValid(input) ? EditableInputWithError : EditableInput

	if (editing) {
		return (
			<Input
				type="text"
				value={input}
				autoFocus
				onBlur={() => {
					if (!isValid(input)) {
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
