import React from 'react'

export const CatNavbar = ({
	name,
	avatar,
}: {
	name: string
	avatar?: string
}) => (
	<div className={'navbar-brand'}>
		<img
			src={avatar || 'https://placekitten.com/30/30'}
			width="30"
			height="30"
			className="d-inline-block align-top avatar"
			alt={name}
		/>
		<span className={'catName'}>{name}</span>
	</div>
)
