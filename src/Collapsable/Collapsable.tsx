import React, { useState } from 'react'
import styled from 'styled-components'

const CollapsableHeader = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	cursor: pointer;
`

const ToggleButton = styled.button`
	border: 0;
	padding: 0;
	background-color: transparent;
	transition-duration: 250ms;
`

const CollapsedButton = styled(ToggleButton)`
	transform: rotate(0);
`

const ExpandedButton = styled(ToggleButton)`
	transform: rotate(180deg);
`

const Content = styled.div`
	margin-top: 1rem;
`

export const Collapsable = ({
	id,
	title,
	initial,
	children,
	onToggle,
}: {
	id: string
	title: React.ReactElement<any>
	initial?: boolean
	children: React.ReactElement<any> | (React.ReactElement<any> | null)[]
	onToggle?: (collapsed: boolean) => void
}) => {
	let initialState = initial ?? false
	if (window.localStorage.getItem(`asset-tracker:toggle:${id}`) === '1') {
		initialState = true
	}
	const [collapsed, setCollapsed] = useState(initialState)

	const toggle = () => {
		const state = !collapsed
		setCollapsed(state)

		onToggle?.(state)
		window.localStorage.setItem(`asset-tracker:toggle:${id}`, state ? '1' : '0')
	}

	return (
		<>
			{collapsed && (
				<div>
					<CollapsableHeader onClick={toggle}>
						<div>{title}</div>
						<CollapsedButton title={'Expand'} onClick={toggle}>
							⌃
						</CollapsedButton>
					</CollapsableHeader>
				</div>
			)}
			{!collapsed && (
				<div>
					<CollapsableHeader onClick={toggle}>
						<div>{title}</div>
						<ExpandedButton color={'link'} title={'Collapse'} onClick={toggle}>
							⌃
						</ExpandedButton>
					</CollapsableHeader>
					<Content>{children}</Content>
				</div>
			)}
		</>
	)
}
