import React from 'react'
import { AuthResponse } from 'msal'
import { DLCard } from '../../DLCard'

export const User = ({ accessToken }: { accessToken: AuthResponse }) => (
	<DLCard
		title="User"
		intro="This card shows info about the current user."
		entries={{
			ID: <code>{accessToken.idToken.subject}</code>,
			'E-Mail': <code>{accessToken.idTokenClaims?.emails?.[0]}</code>,
		}}
	/>
)
