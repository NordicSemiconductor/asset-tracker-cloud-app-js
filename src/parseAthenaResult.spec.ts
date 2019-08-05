import { parseAthenaResult } from './parseAthenaResult'

describe('parseAthenaResult', () => {
	it('parses an Athena result into an array of values', () => {
		expect(
			parseAthenaResult({
				ResultSet: {
					Rows: [
						{ Data: [{ VarCharValue: 'date' }, { VarCharValue: 'value' }] },
						{
							Data: [
								{ VarCharValue: '2019-08-01T10:29:54.406Z' },
								{ VarCharValue: '2607' },
							],
						},
						{
							Data: [
								{ VarCharValue: '2019-07-31T08:34:20.765Z' },
								{ VarCharValue: '2046' },
							],
						},
					],
					ResultSetMetadata: {
						ColumnInfo: [
							{
								CatalogName: 'hive',
								SchemaName: '',
								TableName: '',
								Name: 'date',
								Label: 'date',
								Type: 'varchar',
								Precision: 2147483647,
								Scale: 0,
								Nullable: 'UNKNOWN',
								CaseSensitive: true,
							},
							{
								CatalogName: 'hive',
								SchemaName: '',
								TableName: '',
								Name: 'value',
								Label: 'value',
								Type: 'integer',
								Precision: 10,
								Scale: 0,
								Nullable: 'UNKNOWN',
								CaseSensitive: false,
							},
						],
					},
				},
			}),
		).toEqual([
			{
				date: '2019-08-01T10:29:54.406Z',
				value: 2607,
			},
			{
				date: '2019-07-31T08:34:20.765Z',
				value: 2046,
			},
		])
	})
})
