import React from 'react'
import { LogoImg } from '../Navigation/NavbarBrand'
import styled from 'styled-components'

const CatName = styled.span`
	white-space: nowrap;
`

export const CatNavbar = ({
	name,
	avatar,
}: {
	name: string
	avatar: string
}) => (
	<div className={'navbar-brand'}>
		<LogoImg
			src={avatar}
			width="30"
			height="30"
			className="d-inline-block align-top avatar"
			alt={name}
		/>
		<CatName>{name}</CatName>
	</div>
)
