import { Alert } from 'reactstrap'

export const Success = ({ children }: { children: string }) => (
	<Alert color={'success'}>{children}</Alert>
)
