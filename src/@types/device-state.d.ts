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

export type Accelerometer = {
	v: {
		x: number
		y: number
		z: number
	}
	ts: number
}

export type Environment = {
	v: {
		temp: number
		hum: number
	}
	ts: number
}

export type Battery = {
	v: number
	ts: number
}

export type DeviceInformation = {
	v: {
		band: number
		nw: string
		iccid: string
		modV: string
		brdV: string
		appV: string
	}
	ts: number
}

export type RoamingInformation = {
	v: {
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
export type ReportedGps = MakeReceivedProperty<Gps>
export type ReportedBattery = MakeReceivedProperty<Battery>
export type ReportedAccelerometer = MakeReceivedProperty<Accelerometer>
export type ReportedEnvironment = MakeReceivedProperty<Environment>
export type ReportedDeviceInformation = MakeReceivedProperty<DeviceInformation>
export type ReportedRoamingInformation = MakeReceivedProperty<
	RoamingInformation
>

export type ReportedState = {
	cfg?: ReportedConfigState
	gps?: ReportedGps
	bat?: ReportedBattery
	dev?: ReportedDeviceInformation
	roam?: ReportedRoamingInformation
	acc?: ReportedAccelerometer
	env?: ReportedEnvironment
}
