import { Alert } from 'reactstrap'

export const CatDeleted = ({ catId }: { catId: string }) => (
	<Alert color={'success'}>
		The cat <code>{catId}</code> has been deleted.
	</Alert>
)
