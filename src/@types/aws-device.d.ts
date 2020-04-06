import { MergedReportedState } from '../aws/mergeReportedAndMetadata'
import { DeviceConfig } from './device-state'

export type Gps = {
	v: {
		lat: {
			value: number
			receivedAt: Date
		}
		lng: {
			value: number
			receivedAt: Date
		}
		acc: {
			value: number
			receivedAt: Date
		}
		alt: {
			value: number
			receivedAt: Date
		}
		spd: {
			value: number
			receivedAt: Date
		}
		hdg: {
			value: number
			receivedAt: Date
		}
	}
	ts: {
		value: number
		receivedAt: Date
	}
}

export type Battery = {
	v: {
		value: number
		receivedAt: Date
	}
	ts: {
		value: number
		receivedAt: Date
	}
}

export type Accelerometor = {
	v: {
		value: number
		receivedAt: Date
	}[]
	ts: {
		value: number
		receivedAt: Date
	}
}

export type DeviceInformation = {
	v: {
		band: {
			value: number
			receivedAt: Date
		}
		nw: {
			value: string
			receivedAt: Date
		}
		iccid: {
			value: string
			receivedAt: Date
		}
		modV: {
			value: string
			receivedAt: Date
		}
		brdV: {
			value: string
			receivedAt: Date
		}
		appV: {
			value: string
			receivedAt: Date
		}
	}
	ts: {
		value: number
		receivedAt: Date
	}
}

export type RoamingInformation = {
	v: {
		area: {
			value: number
			receivedAt: Date
		}
		mccmnc: {
			value: number
			receivedAt: Date
		}
		cell: {
			value: number
			receivedAt: Date
		}
		ip: {
			value: string
			receivedAt: Date
		}
		rsrp: {
			value: number
			receivedAt: Date
		}
	}
	ts: {
		value: number
		receivedAt: Date
	}
}

type MergedProperty<A> = {
	value: A
	receivedAt: Date
}

export type ThingReportedState = {
	bat: Battery
	acc: Accelerometor
	gps: Gps
	dev: DeviceInformation
	roam: RoamingInformation
	cfg: Partial<{
		act: MergedProperty<boolean>
		actwt: MergedProperty<number>
		mvres: MergedProperty<number>
		mvt: MergedProperty<number>
		gpst: MergedProperty<number>
		celt: MergedProperty<number>
		acct: MergedProperty<number>
	}>
}

export type ThingState = {
	reported?: Partial<ThingReportedState>
	desired?: {
		cfg?: Partial<DeviceConfig>
	}
}

export type ThingStateMetadataProperty = {
	timestamp: number
} & {
	[key: string]: ThingStateMetadataProperty
}
