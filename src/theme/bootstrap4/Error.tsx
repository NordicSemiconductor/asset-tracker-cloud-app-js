import React from 'react'
import { Alert } from 'reactstrap'
import { ErrorInfo } from '../../Error/ErrorInfo'
import { Card, CardBody } from 'reactstrap'

export const DisplayError = ({ error }: { error: Error | ErrorInfo }) => {
	console.error(error)
	return (
		<Alert color={'danger'}>
			{error instanceof Error ? error.name : error.type}{' '}
			{error.message && `(${error.message})`}
		</Alert>
	)
}

export const ErrorCard = ({ error }: { error: Error | ErrorInfo }) => (
	<Card>
		<CardBody>
			<DisplayError error={error} />
		</CardBody>
	</Card>
)
