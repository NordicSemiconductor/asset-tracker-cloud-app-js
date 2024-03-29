import assert from 'node:assert'
import { describe, test as it } from 'node:test'
import { FOTAStatus } from '../@types/azure-device'
import { DataModules } from '../@types/device-state'
import { toReportedWithReceivedAt } from './toReportedWithReceivedAt'

void describe('toReportedWithReceivedAt', () => {
	void it('should convert a digital twin shadow document to the format used in the generic app components', () => {
		const r = toReportedWithReceivedAt({
			cfg: {
				act: false,
				actwt: 103,
				mvres: 300,
				mvt: 3600,
				gnsst: 60,
				accath: 10.5,
				accith: 5.2,
				accito: 1.7,
				nod: [DataModules.GNSS],
			},
			dev: {
				v: {
					modV: 'device-simulator',
					brdV: 'device-simulator',
					iccid: '12345678901234567890',
					imei: '352656106111232',
				},
				ts: 1587480111020,
			},
			firmware: {
				fwUpdateStatus: FOTAStatus.CURRENT,
				currentFwVersion: '0.0.0-development',
				pendingFwVersion: '',
			},
			roam: {
				v: {
					band: 666,
					nw: 'LAN',
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
					gnsst: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
					accath: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
					accith: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
					accito: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
					nod: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					},
				},
				dev: {
					$lastUpdated: '2020-04-21T14:41:51.6278473Z',
					v: {
						$lastUpdated: '2020-04-21T14:41:51.6278473Z',
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
						band: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
						nw: {
							$lastUpdated: '2020-04-21T14:41:51.6278473Z',
						},
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
				firmware: {
					$lastUpdated: '2020-11-23T11:04:00.8352873Z',
					fwUpdateStatus: {
						$lastUpdated: '2020-11-23T11:04:00.8352873Z',
					},
					currentFwVersion: {
						$lastUpdated: '2020-11-23T11:04:00.8352873Z',
					},
					pendingFwVersion: {
						$lastUpdated: '2020-11-23T11:04:00.8352873Z',
					},
				},
			},
			$version: 85,
		})
		assert.deepStrictEqual(r.cfg, {
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
			gnsst: { value: 60, receivedAt: new Date('2020-04-21T14:41:51.627Z') },
			accath: { value: 10.5, receivedAt: new Date('2020-04-21T14:41:51.627Z') },
			accith: { value: 5.2, receivedAt: new Date('2020-04-21T14:41:51.627Z') },
			accito: { value: 1.7, receivedAt: new Date('2020-04-21T14:41:51.627Z') },
			nod: {
				value: [DataModules.GNSS],
				receivedAt: new Date('2020-04-21T14:41:51.627Z'),
			},
		})
		assert.deepStrictEqual(r.dev, {
			v: {
				value: {
					modV: 'device-simulator',
					brdV: 'device-simulator',
					iccid: '12345678901234567890',
					imei: '352656106111232',
				},
				receivedAt: new Date('2020-04-21T14:41:51.627Z'),
			},
			ts: {
				value: 1587480111020,
				receivedAt: new Date('2020-04-21T14:41:51.627Z'),
			},
		})
		assert.deepStrictEqual(r.roam, {
			v: {
				value: {
					band: 666,
					nw: 'LAN',
					rsrp: 70,
					area: 30401,
					mccmnc: 24201,
					cell: 16964098,
					ip: '0.0.0.0',
				},
				receivedAt: new Date('2020-04-21T14:41:51.627Z'),
			},
			ts: {
				value: 1587480111020,
				receivedAt: new Date('2020-04-21T14:41:51.627Z'),
			},
		})
		assert.deepStrictEqual(r.firmware, {
			fwUpdateStatus: {
				value: FOTAStatus.CURRENT,
				receivedAt: new Date('2020-11-23T11:04:00.8352873Z'),
			},
			currentFwVersion: {
				value: '0.0.0-development',
				receivedAt: new Date('2020-11-23T11:04:00.8352873Z'),
			},
			pendingFwVersion: {
				value: '',
				receivedAt: new Date('2020-11-23T11:04:00.8352873Z'),
			},
		})
	})
})
