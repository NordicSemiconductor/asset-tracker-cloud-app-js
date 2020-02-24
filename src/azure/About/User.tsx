import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Table } from 'reactstrap'
import { Loading } from '../../Loading/Loading'
import { Error as ErrorComponent } from '../../Error/Error'
import { Link } from 'react-router-dom'
import { AccessTokenConsumer } from '../App'
import { AuthResponse } from 'msal'

const UserInfo = ({ accessToken }: { accessToken: AuthResponse }) => {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error>()
	const [user, setUser] = useState<{
		displayName?: string
		surname?: string
		givenName?: string
		id: string
		userPrincipalName: string
		businessPhones?: string[]
		jobTitle?: string
		mail?: string
		mobilePhone?: string
		officeLocation?: string
		preferredLanguage?: string
	}>()
	useEffect(() => {
		const headers = new Headers()
		headers.append('Authorization', 'Bearer ' + accessToken.accessToken)
		const options = {
			method: 'GET',
			headers: headers,
		}
		const graphEndpoint = 'https://graph.microsoft.com/v1.0/me'
		fetch(graphEndpoint, options)
			.then(async resp => {
				setUser(await resp.json())
				setLoading(false)
			})
			.catch(err => {
				console.error(err)
			})
	}, [accessToken])
	return (
		<Card data-intro="This card shows info about the current user.">
			<CardHeader>User</CardHeader>
			<CardBody>
				{loading && <Loading text={'Loading user...'} />}
				{error && <ErrorComponent error={error} />}
				{user && (
					<dl>
						<dt>ID</dt>
						<dd>
							<code>{user.id}</code>
						</dd>
						<dt>Prinicpal Name</dt>
						<dd>
							<code>{user.userPrincipalName}</code>
						</dd>
					</dl>
				)}
			</CardBody>
		</Card>
	)
}

export const User = () => (
	<AccessTokenConsumer>
		{credentials => <UserInfo accessToken={credentials} />}
	</AccessTokenConsumer>
)
