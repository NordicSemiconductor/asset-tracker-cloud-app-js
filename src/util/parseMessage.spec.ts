import { parseMessage } from './parseMessage'

describe('parseMessage', () => {
	it('should parse generic device messages with known properties', () => {
		expect(
			parseMessage({
				btn: {
					v: 1,
					ts: new Date('2019-07-31T10:58:01.385Z').getTime(),
				},
			}),
		).toEqual({
			btn: {
				v: 1,
				ts: new Date('2019-07-31T10:58:01.385Z'),
			},
		})
	})

	it('should parse impact detection messages with known properties', () => {
		expect(
			parseMessage({
				impact: {
					v: 200,
					ts: new Date('2019-07-31T10:58:01.385Z').getTime(),
				},
			}),
		).toEqual({
			impact: {
				v: 200,
				ts: new Date('2019-07-31T10:58:01.385Z'),
			},
		})
	})
})
