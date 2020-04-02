import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Table } from 'reactstrap'
import { Loading } from '../../Loading/Loading'
import { DisplayError as ErrorComponent } from '../../Error/Error'
import { Link } from 'react-router-dom'
import { ApiClient } from '../api'
import { isLeft } from 'fp-ts/lib/Either'
import { ErrorInfo } from '../../Error/ErrorInfo'

export const List = ({ apiClient }: { apiClient: ApiClient }) => {
	const [loading, setLoading] = useState(true)
	const [cats, setCats] = useState([] as { id: string; name: string }[])
	const [error, setError] = useState<ErrorInfo>()
	useEffect(() => {
		let isCancelled = false
		apiClient
			.listDevices()
			.then(res => {
				if (isCancelled) return
				setLoading(false)
				if (isLeft(res)) {
					setError(res.left)
				} else {
					setCats(
						res.right.map(({ deviceId, name }) => ({
							id: deviceId,
							name: name || deviceId,
						})),
					)
				}
			})
			.catch(err => {
				console.error(err)
				if (isCancelled) return
				setLoading(false)
				setError(err)
			})
		return () => {
			isCancelled = true
		}
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
