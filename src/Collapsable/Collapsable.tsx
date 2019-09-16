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

const CollapsedCollapsableDiv = styled.div`
	div.header {
		> button.toggle {
			transform: rotate(0);
		}
		&:hover {
			> button.toggle {
				transform: rotate(180deg);
			}
		}
	}
`

const ExpandedCollapsableDiv = styled.div`
	div.header {
		> button.toggle {
			transform: rotate(180deg);
		}
		&:hover {
			> button.toggle {
				transform: rotate(0);
			}
		}
	}
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
	className,
}: {
	id: string
	title: React.ReactElement<any>
	initial?: boolean
	className?: string
	children: React.ReactElement<any> | (React.ReactElement<any> | null)[]
	onToggle?: (collapsed: boolean) => void
}) => {
	let initialState = !!initial
	if (window.localStorage.getItem(`bifravst:toggle:${id}`) === '1') {
		initialState = true
	}
	const [collapsed, setCollapsed] = useState(initialState)

	const toggle = () => {
		const state = !collapsed
		setCollapsed(state)
		onToggle && onToggle(state)
		window.localStorage.setItem(`bifravst:toggle:${id}`, state ? '1' : '0')
	}

	return (
		<>
			{collapsed && (
				<ExpandedCollapsableDiv className={`collapsable ${className}`}>
					<CollapsableHeader onClick={toggle}>
						<div>{title}</div>
						<ToggleButton title={'Expand'} onClick={toggle}>
							⌃
						</ToggleButton>
					</CollapsableHeader>
				</ExpandedCollapsableDiv>
			)}
			{!collapsed && (
				<CollapsedCollapsableDiv className={`collapsable ${className}`}>
					<CollapsableHeader onClick={toggle}>
						<div>{title}</div>
						<ToggleButton color={'link'} title={'Collapse'} onClick={toggle}>
							⌃
						</ToggleButton>
					</CollapsableHeader>
					<Content>{children}</Content>
				</CollapsedCollapsableDiv>
			)}
		</>
	)
}
