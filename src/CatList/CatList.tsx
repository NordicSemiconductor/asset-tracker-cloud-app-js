import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Table, Badge } from 'reactstrap'
import { RelativeTime } from '../RelativeTime/RelativeTime'
import { emojify } from '../Emojify/Emojify'
import { ButtonWarningProps } from '../ButtonWarnings/ButtonWarnings'

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
}: {
	cats: { id: string; name: string; labels?: string[] }[]
} & ButtonWarningProps) => (
	<Table>
		<tbody>
			{cats.map(({ id, name, labels }) => {
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
