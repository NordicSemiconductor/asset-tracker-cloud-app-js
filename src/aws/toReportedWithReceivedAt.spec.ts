import { toReportedWithReceivedAt } from './toReportedWithReceivedAt'

describe('toReportedWithReceivedAt', () => {
	it('should merge reported with metadata from an AWS IoT Thing shadow document to produce the format used in the generic app components', () => {
		expect(
			toReportedWithReceivedAt({
				reported: {
					gps: {
						v: {
							lng: 10.437087,
							lat: 63.42156,
							acc: 24.798573,
							alt: 170.528305,
							spd: 0.579327,
							hdg: 0,
						},
						ts: new Date('2019-07-31T10:58:01.385Z').getTime(),
					},
					acc: {
						v: [4.6000000000000005, 4.699999999999999, 7.199999999999999],
						ts: new Date('2019-07-31T11:13:15.075Z').getTime(),
					},
					cfg: {
						act: false,
					},
				},
				metadata: {
					reported: {
						gps: {
							v: {
								lng: {
									timestamp: 1564568351,
								},
								lat: {
									timestamp: 1564568351,
								},
								acc: {
									timestamp: 1564568351,
								},
								alt: {
									timestamp: 1564568351,
								},
								spd: {
									timestamp: 1564568351,
								},
								hdg: {
									timestamp: 1564568351,
								},
							},
							ts: {
								timestamp: 1564568351,
							},
						},
						acc: {
							v: [
								{ timestamp: 1564571596 },
								{ timestamp: 1564571596 },
								{ timestamp: 1564571596 },
							],
							ts: { timestamp: 1564571596 },
						},
						cfg: {
							act: {
								timestamp: 1564568288,
							},
						},
					},
				},
			}),
		).toEqual({
			gps: {
				v: {
					value: {
						lng: 10.437087,
						lat: 63.42156,
						acc: 24.798573,
						alt: 170.528305,
						spd: 0.579327,
						hdg: 0,
					},
					receivedAt: new Date(1564568351 * 1000),
				},
				ts: {
					value: new Date('2019-07-31T10:58:01.385Z').getTime(),
					receivedAt: new Date(1564568351 * 1000),
				},
			},
			acc: {
				v: {
					value: [4.6000000000000005, 4.699999999999999, 7.199999999999999],
					receivedAt: new Date(1564571596 * 1000),
				},
				ts: {
					value: new Date('2019-07-31T11:13:15.075Z').getTime(),
					receivedAt: new Date(1564571596 * 1000),
				},
			},
			cfg: {
				act: {
					value: false,
					receivedAt: new Date(1564568288 * 1000),
				},
			},
		})
	})
})
