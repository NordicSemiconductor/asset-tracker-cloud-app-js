import { DLCard } from './DLCard'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Table, Badge, Card, CardHeader } from 'reactstrap'
import { ButtonWarningProps } from '../../ButtonWarnings/ButtonWarnings'
import { emojify } from '../../Emojify/Emojify'
import { RelativeTime } from '../../RelativeTime/RelativeTime'

const Cat = styled.td`
	display: flex;
	justify-content: space-between;
`

const CatWithWarning = styled(Cat)`
	background-color: #ffec8e63;
`

const ClearButton = styled.button`
	border: 0;
	background-color: transparent;
	padding: 0;
	font-size: 80%;
	span {
		margin-right: 0.25rem;
	}
	time {
		opacity: 0.8;
	}
`

const Labels = styled.span`
	.badge + .badge {
		margin-left: 0.125rem;
	}
	margin-right: 0.5rem;
`

export const CatsList = ({
	showButtonWarning,
	snooze,
	cats,
	filterTestDevices,
}: {
	cats: { id: string; name: string; labels?: string[]; isTest?: boolean }[]
	filterTestDevices?: boolean
} & ButtonWarningProps) => {
	if (cats.length === 0) {
		return (
			<DLCard title="Cats" intro="This will list your cats.">
				<p>
					No cats, yet. Read more about how to create{' '}
					<em>Device Credentials</em> for your cat trackers{' '}
					<a
						href={
							'https://nordicsemiconductor.github.io/asset-tracker-cloud-docs/'
						}
						target="_blank"
						rel="noopener noreferrer"
					>
						in the handbook
					</a>
					.
				</p>
			</DLCard>
		)
	}

	return (
		<Card data-intro="This lists your cats. Click on one to see its details.">
			<CardHeader>Cats</CardHeader>
			<Table>
				<tbody>
					{cats
						.filter(
							({ isTest }) => (filterTestDevices ?? true ? !isTest : true), // This is so that test devices do not show up here
						)
						.map(({ id, name, labels }) => {
							const showWarning = showButtonWarning(id)
							const Widget = showWarning ? CatWithWarning : Cat
							return (
								<tr key={id}>
									<Widget>
										<Link to={`/cat/${id}`}>{name}</Link>
										<span>
											{labels && (
												<Labels>
													{labels.map((name) => (
														<Badge pill={true} color={'info'}>
															{name}
														</Badge>
													))}
												</Labels>
											)}
											{showWarning && (
												<ClearButton
													title="Click to snooze alarm"
													onClick={() => snooze(id)}
												>
													{emojify('🔴')}
													<RelativeTime ts={showWarning} />
												</ClearButton>
											)}
										</span>
									</Widget>
								</tr>
							)
						})}
				</tbody>
			</Table>
		</Card>
	)
}
