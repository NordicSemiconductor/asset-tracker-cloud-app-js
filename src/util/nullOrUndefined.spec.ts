import assert from 'node:assert'
import { describe, test as it } from 'node:test'
import { nullOrUndefined } from './nullOrUndefined'

void describe('nullOrUndefined', () => {
	void it('should return true for undefined', () => {
		assert.equal(nullOrUndefined(), true)
	})
	void it('should return true for null', () => {
		assert.equal(nullOrUndefined(null), true)
	})
	void it('should return false for a value', () => {
		assert.equal(nullOrUndefined('some'), false)
	})
})
