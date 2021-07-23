import React from 'react'
import { Card, CardBody } from 'reactstrap'
import { Loading } from './Loading'

export const Progress = ({ title }: { title: string }) => (
	<Card>
		<CardBody>
			<Loading text={title} />
		</CardBody>
	</Card>
)
