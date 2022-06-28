import { Link } from 'react-router-dom'
import { Badge, Table } from 'reactstrap'
import styled from 'styled-components'
import { ButtonWarningProps } from '../ButtonWarnings/ButtonWarnings'
import { emojify } from '../Emojify/Emojify'
import { RelativeTime } from '../RelativeTime/RelativeTime'

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

export const CatList = ({
	cats,
	showButtonWarning,
	snooze,
	filterTestDevices,
}: {
	cats: { id: string; name: string; labels?: string[]; isTest?: boolean }[]
	/**
	 * Filter out
	 */
	filterTestDevices?: boolean
} & ButtonWarningProps) => (
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
)
