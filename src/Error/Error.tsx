import React from 'react'
import { Alert } from 'reactstrap'

export const Error = ({ error }: { error: Error }) => {
	console.error(error)
	return (
		<Alert color={'danger'}>
			{error.name}
			{error.message && `(${error.message})`}
		</Alert>
	)
}
