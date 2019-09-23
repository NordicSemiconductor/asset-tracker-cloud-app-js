import { rsrpToPercent } from './rsrpToPercent'

describe('rsrpToPercent', () => {
	it.each([
		[-111, 0],
		[-110, 0],
		[-100, 25],
		[-90, 50],
		[-80, 75],
		[-70, 100],
		[-69, 100],
	])('%i: %i%%', (rsrp, percent) => {
		expect(rsrpToPercent(rsrp) * 100).toEqual(percent)
	})
})
