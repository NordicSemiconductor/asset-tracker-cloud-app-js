import {
	DeviceConfig,
	Gps,
	Battery,
	DeviceInformation,
	RoamingInformation,
	Accelerometer,
} from './device-state'

type PropertyMetadata = {
	$lastUpdated: string
	$lastUpdatedVersion?: number
}

export type MakePropertyMetadata<Type> = {
	readonly [Key in keyof Type]: PropertyMetadata<Type[Key]>
}

export type DeviceTwinReported = {
	cfg?: Partial<DeviceConfig>
	gps?: Gps
	bat?: Battery
	dev?: DeviceInformation
	roam?: RoamingInformation
	acc?: Accelerometer
	$metadata: PropertyMetadata & {
		cfg?: PropertyMetadata & MakePropertyMetadata<DeviceConfig>
		gps?: PropertyMetadata & MakePropertyMetadata<Gps>
		bat?: PropertyMetadata & MakePropertyMetadata<Battery>
		dev?: PropertyMetadata & MakePropertyMetadata<DeviceInformation>
		roam?: PropertyMetadata & MakePropertyMetadata<RoamingInformation>
		acc?: PropertyMetadata & MakePropertyMetadata<Accelerometer>
	}
	$version: number
}

export type DeviceTwinDesired = {
	cfg?: Partial<DeviceConfig>
	$metadata: PropertyMetadata & {
		cfg?: PropertyMetadata & MakePropertyMetadata<DeviceConfig>
	}
	$version: number
}

export type DeviceTwin = {
	desired: DeviceTwinDesired
	reported: DeviceTwinReported
}
