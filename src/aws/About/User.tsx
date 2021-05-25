import React from 'react'
import { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader } from 'reactstrap'
import { Auth } from 'aws-amplify'
import { CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js'

export const User = ({ identityId }: { identityId: string }) => {
	const [user, setUser] = useState<CognitoUserAttribute[]>()

	useEffect(() => {
		let isCancelled = false
		Auth.currentAuthenticatedUser()
			.then((user: CognitoUser) => {
				user.getUserAttributes((err, attrs) => {
					if (err) {
						console.error(err)
						return
					}
					if (!isCancelled) {
						setUser(attrs)
					}
				})
			})
			.catch(console.error)
		return () => {
			isCancelled = true
		}
	}, [])
	return (
		<Card data-intro="This card shows info about the current user.">
			<CardHeader>User</CardHeader>
			<CardBody>
				<dl>
					<dt>ID</dt>
					<dd>
						<code>{identityId}</code>
					</dd>
					{user && (
						<>
							<dt>E-Mail</dt>
							<dd>
								<code>
									{user.find((attr) => attr.getName() === 'email')?.getValue()}
								</code>
							</dd>
						</>
					)}
				</dl>
			</CardBody>
		</Card>
	)
}
