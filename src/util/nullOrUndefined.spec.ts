import { nullOrUndefined } from './nullOrUndefined'

describe('nullOrUndefined', () => {
	it('should return true for undefined', () => {
		expect(nullOrUndefined()).toEqual(true)
	})
	it('should return true for null', () => {
		expect(nullOrUndefined(null)).toEqual(true)
	})
	it('should return false for a value', () => {
		expect(nullOrUndefined('some')).toEqual(false)
	})
})
