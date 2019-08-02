import Athena from 'aws-sdk/clients/athena'

const parseValue = ({ value, type }: { value?: string; type: string }) => {
	if (value === undefined) {
		return value
	}
	switch (type) {
		case 'integer':
			return parseInt(value, 10)
		default:
			return value
	}
}

export type ParsedResult = { [key: string]: string | number }[]

export const parseAthenaResult = ({
	Rows,
	ResultSetMetadata,
}: Athena.ResultSet): ParsedResult => {
	if (!Rows || !ResultSetMetadata || !ResultSetMetadata.ColumnInfo) {
		return []
	}
	const { ColumnInfo } = ResultSetMetadata
	return Rows.slice(1).map(({ Data }) => {
		if (!Data) {
			return {}
		}
		return ColumnInfo.reduce(
			(result, { Name, Type }, key) => ({
				...result,
				[Name]: parseValue({
					value: Data[key].VarCharValue,
					type: Type,
				}),
			}),
			{},
		)
	})
}
