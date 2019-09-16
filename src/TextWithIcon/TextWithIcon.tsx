import React from 'react'
import styled from 'styled-components'

const TextWithIconSpan = styled.span`
	display: flex;
	flex-direction: row;
	align-items: center;
	svg {
		margin-right: 0.2rem;
	}
`

export const TextWithIcon = ({
	icon,
	children,
}: {
	children: React.ReactElement<any> | React.ReactElement<any>[] | string
	icon: React.ReactElement<any>
}) => (
	<TextWithIconSpan>
		{icon}
		{children}
	</TextWithIconSpan>
)
