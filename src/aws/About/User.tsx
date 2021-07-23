import React from 'react'
import { useEffect, useState } from 'react'
import { Auth } from 'aws-amplify'
import { CognitoUser, CognitoUserAttribute } from 'amazon-cognito-identity-js'

export const User = ({
	identityId,
	render,
}: {
	identityId: string
	render: (props: { identityId: string; email?: string }) => JSX.Element
}) => {
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
	return render({
		identityId,
		email: user?.find((attr) => attr.getName() === 'email')?.getValue(),
	})
}
