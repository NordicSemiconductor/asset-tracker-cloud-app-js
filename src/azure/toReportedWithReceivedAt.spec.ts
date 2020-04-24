import { toReportedWithReceivedAt } from './toReportedWithReceivedAt'

describe('toReportedWithReceivedAt', () => {
	it('should convert a digital twin shadow document to the format used in the generic app components', () => {
		const r = toReportedWithReceivedAt({
			cfg: {
				act: false,
				actwt: 103,
				mvres: 300,
				mvt: 3600,
				gpst: 60,
				celt: 600,
				acct: 1,
			},
			dev: {
				v: {
					band: 666,
					nw: 'LAN',
					modV: 'device-simulator',
					brdV: 'device-simulator',
					appV: '0.0.0-development',
					iccid: '12345678901234567890',
				},
				ts: 1587480111020,
			},
			roam: {
				v: {
					rsrp: 70,
					area: 30401,
					mccmnc: 24201,
					cell: 16964098,
					ip: '0.0.0.0',
				},
				ts: 1587480111020,
			},
			$metadata: {
				$lastUpdated: '2020-04-21T14:41:51.6278473Z',
				cfg: {
					$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					act: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
					actwt: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
					mvres: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
					mvt: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
					gpst: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
					celt: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
					acct: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
				},
				dev: {
					$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					v: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						band: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
						nw: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
						modV: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
						brdV: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
						appV: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
						iccid: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
					},
					ts: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
				},
				roam: {
					$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					v: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						rsrp: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
						area: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
						mccmnc: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
						cell: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
						ip: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
					},
					ts: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
				},
			},
			$version: 85,
		})
		expect(r.cfg).toEqual({
			act: {
				value: false,
				receivedAt: new Date('2020-04-21T14:41:51.627Z'),
			},
			actwt: {
				value: 103,
				receivedAt: new Date('2020-04-21T14:41:51.627Z'),
			},
			mvres: { value: 300, receivedAt: new Date('2020-04-21T14:41:51.627Z') },
			mvt: { value: 3600, receivedAt: new Date('2020-04-21T14:41:51.627Z') },
			gpst: { value: 60, receivedAt: new Date('2020-04-21T14:41:51.627Z') },
			celt: { value: 600, receivedAt: new Date('2020-04-21T14:41:51.627Z') },
			acct: { value: 1, receivedAt: new Date('2020-04-21T14:41:51.627Z') },
		})
		expect(r.dev).toEqual({
			v: {
				value: {
					band: 666,
					nw: 'LAN',
					modV: 'device-simulator',
					brdV: 'device-simulator',
					appV: '0.0.0-development',
					iccid: '12345678901234567890',
				},
				receivedAt: new Date('2020-04-21T14:41:51.627Z'),
			},
			ts: {
				value: 1587480111020,
				receivedAt: new Date('2020-04-21T14:41:51.627Z'),
			},
		})
	})
})
