import React, { useState } from 'react'
import styled from 'styled-components'

const CollapsableDiv = styled.div`
	div.header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		cursor: pointer;
		> button.toggle {
			border: 0;
			padding: 0;
			background-color: transparent;
			transition-duration: 250ms;
		}
	}
`

const CollapsedCollapsableDiv = styled(CollapsableDiv)`
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

const ExpandedCollapsableDiv = styled(CollapsableDiv)`
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
					<div className={'header'} onClick={toggle}>
						<div className={'title'}>{title}</div>
						<button className={'toggle'} title={'Expand'} onClick={toggle}>
							⌃
						</button>
					</div>
				</ExpandedCollapsableDiv>
			)}
			{!collapsed && (
				<CollapsedCollapsableDiv className={`collapsable ${className}`}>
					<div className={'header'} onClick={toggle}>
						<div className={'title'}>{title}</div>
						<button
							className={'toggle'}
							color={'link'}
							title={'Collapse'}
							onClick={toggle}
						>
							⌃
						</button>
					</div>
					<div className={'content'}>{children}</div>
				</CollapsedCollapsableDiv>
			)}
		</>
	)
}
