import React from 'react'
import { Button } from 'reactstrap'
import { DLCard } from '../DLCard'

export const ClearCache = ({ onClick }: { onClick: () => unknown }) => (
	<DLCard
		title="Cache"
		intro="You can clear the application's cache using this button."
	>
		<p>
			<Button data- outline color="danger" onClick={onClick}>
				Clear app cache
			</Button>
		</p>
	</DLCard>
)
