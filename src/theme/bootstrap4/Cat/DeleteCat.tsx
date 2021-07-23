import React from 'react'
import { Button } from 'reactstrap'
import { FooterWithFullWidthButton } from '../../../Settings/Settings'

export const DeleteCat = ({
	catId,
	onDelete,
}: {
	catId: string
	onDelete: () => void
}) => (
	<FooterWithFullWidthButton>
		<Button
			color={'danger'}
			onClick={() => {
				if (window.confirm(`Really delete ${catId}?`)) {
					onDelete()
				}
			}}
		>
			Delete
		</Button>
	</FooterWithFullWidthButton>
)
