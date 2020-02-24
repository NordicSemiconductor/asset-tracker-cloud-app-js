import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Table } from 'reactstrap'
import { Loading } from '../../Loading/Loading'
import { Error as ErrorComponent } from '../../Error/Error'
import { Link } from 'react-router-dom'
import { ApiClientConsumer, ApiClient } from '../App'

const ListCats = ({ apiClient }: { apiClient: ApiClient }) => {
	const [loading, setLoading] = useState(true)
	const [cats, setCats] = useState([] as { id: string; name: string }[])
	const [error, setError] = useState<Error>()
	useEffect(() => {
		apiClient
			.listDevices()
			.then(res => {
				setCats(res.map(({ deviceId }) => ({ id: deviceId, name: deviceId })))
				setLoading(false)
			})
			.catch(err => {
				setLoading(false)
				setError(err)
			})
	}, [apiClient])
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

export const List = () => (
	<ApiClientConsumer>
		{apiClient => <ListCats apiClient={apiClient} />}
	</ApiClientConsumer>
)
