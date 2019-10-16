import React from 'react'
import { Button, Card, CardBody, CardHeader } from 'reactstrap'
import { Cache as AmplifyCache } from 'aws-amplify'

export const Cache = () => (
	<Card>
		<CardHeader>Cache</CardHeader>
		<CardBody>
			<p>
				<Button
					data-intro="You can clear the application's cache using this button."
					outline
					color="danger"
					onClick={() => {
						AmplifyCache.clear()
					}}
				>
					Clear app cache
				</Button>
			</p>
		</CardBody>
	</Card>
)
