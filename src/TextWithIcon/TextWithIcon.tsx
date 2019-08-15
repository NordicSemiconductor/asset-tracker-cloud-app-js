import React from 'react'

import './TextWithIcon.scss'

export const TextWithIcon = ({
	icon,
	children,
}: {
	children: React.ReactElement<any> | React.ReactElement<any>[] | string
	icon: React.ReactElement<any>
}) => (
	<span className={'textWithIcon'}>
		{icon}
		{children}
	</span>
)
