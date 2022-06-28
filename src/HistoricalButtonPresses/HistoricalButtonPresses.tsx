import { Table } from 'reactstrap'
import { RelativeTime } from '../RelativeTime/RelativeTime'

export const HistoricalButtonPresses = ({
	data,
}: {
	data: { value: number; date: Date }[]
}) => (
	<Table>
		<thead>
			<tr>
				<th>Button</th>
				<th>Time</th>
			</tr>
		</thead>
		<tbody>
			{data.map(({ value, date }, k) => (
				<tr key={k}>
					<td>{value}</td>
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
