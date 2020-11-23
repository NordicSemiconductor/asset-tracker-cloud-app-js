import {
	DeviceConfig,
	Gps,
	Battery,
	DeviceInformation,
	RoamingInformation,
	Accelerometer,
	Environment,
	MakeReceivedProperty,
	ReportedState,
} from './device-state'

export type PropertyMetadata = Record<string, any> & {
	$lastUpdated: string
	$lastUpdatedVersion?: number
}

/**
 * Device FOTA status
 * @see https://docs.microsoft.com/en-us/azure/iot-hub/tutorial-firmware-update
 */
export enum FOTAStatus {
	// There is no pending firmware update. currentFwVersion should match fwVersion from desired properties.
	CURRENT = 'current',
	// Firmware update image is downloading.
	DOWNLOADING = 'downloading',
	// Verifying image file checksum and any other validations.
	VERIFYING = 'verifying',
	// Update to the new image file is in progress.
	APPLYING = 'applying',
	// Device is rebooting as part of update process.
	REBOOTING = 'rebooting',
	// An error occurred during the update process. Additional details should be specified in fwUpdateSubstatus.
	ERROR = 'error',
	// Update rolled back to the previous version due to an error.
	ROLLEDBACK = 'rolledback',
}

export type AzureFOTAJob = {
	fwVersion: string
	fwPackageURI: string
}

export type AzureFOTAJobProgress = {
	fwUpdateStatus: FOTAStatus
	currentFwVersion: string
	pendingFwVersion: string
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
	firmware?: AzureFOTAJobProgress
	$metadata: PropertyMetadata & {
		cfg?: PropertyMetadata & MakePropertyMetadata<DeviceConfig>
		gps?: PropertyMetadata & MakePropertyMetadata<Gps>
		bat?: PropertyMetadata & MakePropertyMetadata<Battery>
		dev?: PropertyMetadata & MakePropertyMetadata<DeviceInformation>
		roam?: PropertyMetadata & MakePropertyMetadata<RoamingInformation>
		acc?: PropertyMetadata & MakePropertyMetadata<Accelerometer>
		env?: PropertyMetadata & MakePropertyMetadata<Environment>
		firmware?: PropertyMetadata & MakePropertyMetadata<AzureFOTAJobProgress>
	}
	$version: number
}

export type DeviceTwinDesired = {
	cfg?: Partial<DeviceConfig>
	firmware?: AzureFOTAJob
	$metadata: PropertyMetadata & {
		cfg?: PropertyMetadata & MakePropertyMetadata<DeviceConfig>
		firmware?: PropertyMetadata & MakePropertyMetadata<AzureFOTAJob>
	}
	$version: number
}

export type DeviceTwin = {
	desired: DeviceTwinDesired
	reported: DeviceTwinReported
}

export type ReportedFOTAJobProgress = MakeReceivedProperty<AzureFOTAJobProgress>

export type AzureReportedState = ReportedState & {
	firmware?: ReportedFOTAJobProgress
}
