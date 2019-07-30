import React, { useEffect, useState } from 'react'
import { IotContext } from '../App'
import { Table, Card, CardHeader } from 'reactstrap'
import { Iot } from 'aws-sdk'
import { Loading } from '../Loading/Loading'
import { Error } from '../Error/Error'

const ListCats = ({ iot }: { iot: Iot }) => {
	const [loading, setLoading] = useState(true)
	const [cats, setCats] = useState([] as { id: string, name: string }[])
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
	if (loading) return <Loading text={'Herding cats...'} />
	if (error) return <Error error={error} />
	return (
		<Card>
			<CardHeader>Cats</CardHeader>
			<Table>
				<tbody>
					{cats.map(({ id, name }) => (
						<tr key={id}>
							<td>
								<a href={`/cat/${id}`}>{name}</a>
							</td>
						</tr>
					))}
				</tbody>
			</Table>
		</Card>
	)
}

export const List = () => (
	<IotContext.Consumer>
		{({ iot }) => <ListCats iot={iot} />}
	</IotContext.Consumer>
)
