import React, { useState } from 'react'
import styled from 'styled-components'
import { emojify } from '../theme/Emojify/Emojify'

const MapToggleButton = styled.button`
	border: 0;
	padding: 0;
	background-color: #ffffffaf;
	display: block;
	height: 50px;
	width: 65px;
	transition-duration: 250ms;
	img.emoji,
	& > span {
		width: 25px;
		height: 25px;
	}
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	bottom: 0;
	left: 0;
	z-index: 1000;
`
const ActiveButton = styled(MapToggleButton)``

const Chevron = styled.span``

const InactiveButton = styled(MapToggleButton)``

export const ShowSettingsButton = ({
	initial,
	onToggle,
}: {
	initial?: boolean
	onToggle?: (collapsed: boolean) => void
}) => {
	const initialState = initial ?? true

	const [collapsed, setCollapsed] = useState(initialState)

	const toggle = () => {
		const state = !collapsed
		setCollapsed(state)
		onToggle?.(state)
	}

	if (collapsed)
		return (
			<ActiveButton title={'Expand'} onClick={toggle}>
				{emojify('⚙️')}
				<Chevron>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="6 9 12 15 18 9"></polyline>
					</svg>
				</Chevron>
			</ActiveButton>
		)

	return (
		<InactiveButton color={'link'} title={'Collapse'} onClick={toggle}>
			{emojify('⚙️')}
			<Chevron>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="18 15 12 9 6 15"></polyline>
				</svg>
			</Chevron>
		</InactiveButton>
	)
}
