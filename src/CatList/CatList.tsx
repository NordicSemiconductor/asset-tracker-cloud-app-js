import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Table } from 'reactstrap'
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

export const CatList = ({
	cats,
	showButtonWarning,
	snooze,
}: {
	cats: { id: string; name: string }[]
} & ButtonWarningProps) => (
	<Table>
		<tbody>
			{cats.map(({ id, name }) => {
				const showWarning = showButtonWarning(id)
				const Widget = showWarning ? CatWithWarning : Cat
				return (
					<tr key={id}>
						<Widget>
							<Link to={`/cat/${id}`}>{name}</Link>
							{showWarning && (
								<ClearButton
									title="Click to snooze alarm"
									onClick={() => snooze(id)}
								>
									{emojify('🔴')}
									<RelativeTime ts={showWarning} />
								</ClearButton>
							)}
						</Widget>
					</tr>
				)
			})}
		</tbody>
	</Table>
)
