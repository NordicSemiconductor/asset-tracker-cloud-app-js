import React from 'react'
import { DLCard } from '../../DLCard'

export const User = ({
	identityId,
	email,
}: {
	identityId: string
	email?: string
}) => (
	<DLCard
		title="User"
		intro="This card shows info about the current user."
		entries={{
			...{ ID: <code>{identityId}</code> },
			...(email !== undefined && { 'E-Mail': <code>{email}</code> }),
		}}
	/>
)
