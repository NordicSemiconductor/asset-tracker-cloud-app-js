import assert from 'node:assert'
import { describe, test as it } from 'node:test'
import { parseMessage } from './parseMessage'
void describe('parseMessage', () => {
	void it('should parse generic device messages with known properties', () => {
		assert.deepStrictEqual(
			parseMessage({
				btn: {
					v: 1,
					ts: new Date('2019-07-31T10:58:01.385Z').getTime(),
				},
			}),
			{
				btn: {
					v: 1,
					ts: new Date('2019-07-31T10:58:01.385Z'),
				},
			},
		)
	})

	void it('should parse impact detection messages with known properties', () => {
		assert.deepStrictEqual(
			parseMessage({
				impact: {
					v: 200,
					ts: new Date('2019-07-31T10:58:01.385Z').getTime(),
				},
			}),
			{
				impact: {
					v: 200,
					ts: new Date('2019-07-31T10:58:01.385Z'),
				},
			},
		)
	})
})
