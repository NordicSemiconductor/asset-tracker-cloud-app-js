export type DeviceConfig = {
	act: boolean
	actwt: number
	mvres: number
	mvt: number
	gpst: number
	celt: number
	acct: number
}

export type Gps = {
	v: {
		lat: number
		lng: number
		acc: number
		alt: number
		spd: number
		hdg: number
	}
	ts: number
}

type ReceivedPropery<A> = {
	value: A
	receivedAt: Date
}

type MakeReceivedProperty<Type> = {
	readonly [Key in keyof Type]: ReceivedPropery<Type[Key]>
}

export type ReportedConfigState = MakeReceivedProperty<DeviceConfig>
export type ReportedGps = MakeReceivedProperty<Gps>
