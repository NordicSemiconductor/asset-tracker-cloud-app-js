import Athena from 'aws-sdk/clients/athena'

export type ParsedResult = { [key: string]: string | number }[]

const defaultFormatters = {
	integer: (v: string) => parseInt(v, 10),
	default: (v: string) => v,
} as { [key: string]: (v: string) => any }

export const parseAthenaResult = ({
	ResultSet: { Rows, ResultSetMetadata },
	formatters,
}: {
	ResultSet: Athena.ResultSet
	formatters?: {
		integer: (v: string) => number
	}
}): ParsedResult => {
	if (!Rows || !ResultSetMetadata || !ResultSetMetadata.ColumnInfo) {
		return []
	}
	const { ColumnInfo } = ResultSetMetadata
	return Rows.slice(1).map(({ Data }) => {
		if (!Data) {
			return {}
		}
		return ColumnInfo.reduce((result, { Name, Type }, key) => {
			let v = Data[key].VarCharValue
			if (v !== undefined) {
				const formatter =
					(formatters || defaultFormatters)[Type] || defaultFormatters.default
				v = formatter(v)
			}
			return {
				...result,
				[Name]: v,
			}
		}, {})
	})
}
