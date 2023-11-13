import assert from 'node:assert'
import { describe, test as it } from 'node:test'
import { centerOnLatestLocation } from './centerOnLatestLocation'

void describe('centerOnLatestLocation', () => {
	void it('should return the position of the latest location', () => {
		assert.deepStrictEqual(
			centerOnLatestLocation([
				{ position: { lat: 1, lng: 2 }, ts: new Date('2021-01-31T00:00:00Z') },
				{ position: { lat: 2, lng: 3 }, ts: new Date('2021-05-31T00:00:00Z') },
				undefined,
				{ position: { lat: 4, lng: 5 }, ts: new Date('2021-03-31T00:00:00Z') },
			]),
			{ lat: 2, lng: 3 },
		)
	})
})
