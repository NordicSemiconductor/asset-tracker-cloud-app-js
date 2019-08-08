import React, { useEffect, useState } from 'react'
import { IotConsumer } from '../App'
import { Card, CardBody, CardHeader, Table } from 'reactstrap'
import { Iot } from 'aws-sdk'
import { Loading } from '../Loading/Loading'
import { Error } from '../Error/Error'
import { Link } from 'react-router-dom'

const ListCats = ({ iot }: { iot: Iot }) => {
	const [loading, setLoading] = useState(true)
	const [cats, setCats] = useState([] as { id: string; name: string }[])
	const [error, setError] = useState()
	useEffect(() => {
		iot
			.listThings()
			.promise()
			.then(({ things }) => {
				setCats(
					(things || []).map(({ thingName, attributes }) => ({
						id: thingName || 'unknown',
						name: (attributes && attributes.name) || thingName || 'unknown',
					})),
				)
				setLoading(false)
			})
			.catch(err => {
				setError(err)
				setLoading(false)
			})
	}, [iot])
	if (loading || error)
		return (
			<Card>
				<CardBody>
					{loading && <Loading text={'Herding cats...'} />}
					{error && <Error error={error} />}
				</CardBody>
			</Card>
		)
	return (
		<Card data-intro="This lists your cats. Click on one to see its details.">
			<CardHeader>Cats</CardHeader>
			{cats.length && (
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
				<div>
					No cats, yet. Read more about how to create{' '}
					<em>Device Credentials</em> for your cat trackers{' '}
					<a href={'https://bifravst.github.io/'}>in the handbook</a>.
				</div>
			)}
		</Card>
	)
}

export const List = () => (
	<IotConsumer>{({ iot }) => <ListCats iot={iot} />}</IotConsumer>
)
