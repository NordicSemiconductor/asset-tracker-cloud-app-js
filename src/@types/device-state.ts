export enum DataModules {
	GNSS = 'gnss',
	NeigboringCellMeasurements = 'ncell',
}

export type DeviceConfig = {
	act: boolean
	actwt: number
	mvres: number
	mvt: number
	gnsst: number
	acct: number
	nod: DataModules[]
}

export type Gnss = {
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

export type Environment = {
	v: {
		temp: number
		hum: number
		atmp: number
	}
	ts: number
}

export type Battery = {
	v: number
	ts: number
}

export type DeviceInformation = {
	v: {
		iccid: string
		imei: string
		modV: string
		brdV: string
	}
	ts: number
}

export type RoamingInformation = {
	v: {
		band: number
		nw: string
		area: number
		mccmnc: number
		cell: number
		ip: string
		rsrp: number
	}
	ts: number
}

export type ReceivedProperty<A> = {
	value: A
	receivedAt: Date
}

export type MakeReceivedProperty<Type> = {
	readonly [Key in keyof Type]: ReceivedProperty<Type[Key]>
}

export type ReportedConfigState = Partial<MakeReceivedProperty<DeviceConfig>>
export type ReportedGnss = MakeReceivedProperty<Gnss>
export type ReportedBattery = MakeReceivedProperty<Battery>
export type ReportedEnvironment = MakeReceivedProperty<Environment>
export type ReportedDeviceInformation = MakeReceivedProperty<DeviceInformation>
export type ReportedRoamingInformation =
	MakeReceivedProperty<RoamingInformation>

export type ReportedState = {
	cfg?: ReportedConfigState
	gnss?: ReportedGnss
	bat?: ReportedBattery
	dev?: ReportedDeviceInformation
	roam?: ReportedRoamingInformation
	env?: ReportedEnvironment
}

export type NCellMeasReport = {
	reportId: string
	nw: string
	mcc: number
	mnc: number
	cell: number
	area: number
	earfcn: number
	adv: number
	rsrp: number
	rsrq: number
	nmr?: {
		earfcn: number
		cell: number
		rsrp: number
		rsrq: number
	}[]
	reportedAt: Date
	receivedAt: Date
	unresolved?: boolean
	position?: {
		lat: number
		lng: number
		accuracy: number
	}
}
