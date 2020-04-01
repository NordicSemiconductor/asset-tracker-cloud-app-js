import React from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { AuthResponse } from 'msal'

export const User = ({ accessToken }: { accessToken: AuthResponse }) => (
	<Card data-intro="This card shows info about the current user.">
		<CardHeader>User</CardHeader>
		<CardBody>
			<dl>
				<dt>ID</dt>
				<dd>
					<code>{accessToken.idToken.subject}</code>
				</dd>
				<dt>Email</dt>
				<dd>
					<code>{JSON.stringify(accessToken.idTokenClaims?.emails?.[0])}</code>
				</dd>
			</dl>
		</CardBody>
	</Card>
)
