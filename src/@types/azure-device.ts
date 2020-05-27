import {
	DeviceConfig,
	Gps,
	Battery,
	DeviceInformation,
	RoamingInformation,
	Accelerometer,
	Environment,
	MakeReceivedProperty,
} from './device-state'

export type PropertyMetadata = {
	$lastUpdated: string
	$lastUpdatedVersion?: number
}

export enum FOTAStatus {
	IN_PROGRESS = 'IN_PROGRESS',
	QUEUED = 'QUEUED',
	FAILED = 'FAILED',
	SUCCEEDED = 'SUCCEEDED',
}

export type AzureFOTAJob = {
	jobId: string
	location: string
	status: FOTAStatus
}

export type AzureFOTAJobProgress = {
	jobId: string
	status: FOTAStatus
}

export type MakePropertyMetadata<Type> = {
	readonly [Key in keyof Type]: PropertyMetadata
}

export type DeviceTwinReported = {
	cfg?: Partial<DeviceConfig>
	gps?: Gps
	bat?: Battery
	dev?: DeviceInformation
	roam?: RoamingInformation
	acc?: Accelerometer
	env?: Environment
	fota?: AzureFOTAJobProgress
	$metadata: PropertyMetadata & {
		cfg?: PropertyMetadata & MakePropertyMetadata<DeviceConfig>
		gps?: PropertyMetadata & MakePropertyMetadata<Gps>
		bat?: PropertyMetadata & MakePropertyMetadata<Battery>
		dev?: PropertyMetadata & MakePropertyMetadata<DeviceInformation>
		roam?: PropertyMetadata & MakePropertyMetadata<RoamingInformation>
		acc?: PropertyMetadata & MakePropertyMetadata<Accelerometer>
		env?: PropertyMetadata & MakePropertyMetadata<Environment>
		fota?: PropertyMetadata & MakePropertyMetadata<AzureFOTAJobProgress>
	}
	$version: number
}

export type DeviceTwinDesired = {
	cfg?: Partial<DeviceConfig>
	fota?: AzureFOTAJob
	$metadata: PropertyMetadata & {
		cfg?: PropertyMetadata & MakePropertyMetadata<DeviceConfig>
		fota?: PropertyMetadata & MakePropertyMetadata<AzureFOTAJob>
	}
	$version: number
}

export type DeviceTwin = {
	desired: DeviceTwinDesired
	reported: DeviceTwinReported
}

export type ReportedFOTAJobProgress = MakeReceivedProperty<AzureFOTAJobProgress>
