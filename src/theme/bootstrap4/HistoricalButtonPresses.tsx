import React from 'react'
import { Table } from 'reactstrap'
import { RelativeTime } from '../../RelativeTime/RelativeTime'

export const HistoricalButtonPresses = ({
	presses,
}: {
	presses: { button: number; date: Date }[]
}) => (
	<Table>
		<thead>
			<tr>
				<th>Button</th>
				<th>Time</th>
			</tr>
		</thead>
		<tbody>
			{presses.map(({ button, date }, k) => (
				<tr key={k}>
					<td>{button}</td>
					<td>
						{date.toLocaleString()}{' '}
						<small>
							(<RelativeTime ts={date} />)
						</small>
					</td>
				</tr>
			))}
		</tbody>
	</Table>
)
