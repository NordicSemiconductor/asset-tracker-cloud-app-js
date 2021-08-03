import React, { useState } from 'react'

export const Toggle = ({
	children,
}: {
	children: JSX.Element | (JSX.Element | null)[]
}) => {
	const [toggled, setToggled] = useState(false)

	const toggle = () => {
		const state = !toggled
		setToggled(state)
	}

	return (
		<div className={`toggle ${toggled && 'toggle-on'}`} onClick={toggle}>
			{children}
		</div>
	)
}
