import React, { useState } from 'react'
import classNames from 'classnames'

export const Toggle = ({
	children,
}: {
	children: React.ReactElement<any> | (React.ReactElement<any> | null)[]
}) => {
	const [toggled, setToggled] = useState(false)

	const toggle = () => {
		const state = !toggled
		setToggled(state)
	}

	return (
		<div
			className={classNames('toggle', { 'toggle-on': toggled })}
			onClick={toggle}
		>
			{children}
		</div>
	)
}
