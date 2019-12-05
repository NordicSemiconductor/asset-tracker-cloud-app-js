import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Table } from 'reactstrap'
import { Loading } from '../../Loading/Loading'
import { Error as ErrorComponent } from '../../Error/Error'
import { Link } from 'react-router-dom'
import { IotHubClient } from '@azure/arm-iothub'
import { ServiceClientCredentialsConsumer } from '../App'
import { ServiceClientCredentials } from '@azure/ms-rest-js'

const ListCats = ({
	serviceClientCredentials,
}: {
	serviceClientCredentials: ServiceClientCredentials
}) => {
	const [loading, setLoading] = useState(true)
	const [cats, setCats] = useState([] as { id: string; name: string }[])
	const [error, setError] = useState()
	useEffect(() => {
		const client = new IotHubClient(
			serviceClientCredentials,
			'd099159f-d88c-4aff-a5a3-8dc235ac0fdf',
		)
		client.operations
			.list()
			.then(result => {
				console.log('The result is:')
				console.log(result)
			})
			.catch(err => {
				console.log('An error occurred:')
				console.error(err)
			})
	}, [serviceClientCredentials])
	if (loading || error)
		return (
			<Card>
				<CardBody>
					{loading && <Loading text={'Herding cats...'} />}
					{error && <ErrorComponent error={error} />}
				</CardBody>
			</Card>
		)
	return (
		<Card data-intro="This lists your cats. Click on one to see its details.">
			<CardHeader>Cats</CardHeader>
			{cats.length > 0 && (
				<Table>
					<tbody>
						{cats.map(({ id, name }) => (
							<tr key={id}>
								<td>
									<Link to={`/cat/${id}`}>{name}</Link>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			)}
			{!cats.length && (
				<CardBody>
					No cats, yet. Read more about how to create{' '}
					<em>Device Credentials</em> for your cat trackers{' '}
					<a
						href={'https://bifravst.github.io/'}
						target="_blank"
						rel="noopener noreferrer"
					>
						in the handbook
					</a>
					.
				</CardBody>
			)}
		</Card>
	)
}

export const List = () => {
	return (
		<ServiceClientCredentialsConsumer>
			{credentials => <ListCats serviceClientCredentials={credentials} />}
		</ServiceClientCredentialsConsumer>
	)
}
