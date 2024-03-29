import { Alert } from 'reactstrap'
import { ErrorInfo } from './ErrorInfo'

export const DisplayError = ({ error }: { error: Error | ErrorInfo }) => {
	console.error(error)
	return (
		<Alert color={'danger'}>
			{error instanceof Error ? error.name : error.type}{' '}
			{error.message && `(${error.message})`}
		</Alert>
	)
}
