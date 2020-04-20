import { DeviceConfig, Gps } from './device-state'

type PropertyMetadata = {
	[key: string]: {
		$lastUpdated: string
		$lastUpdatedVersion?: number
	}
}

export type DeviceTwinState = {
	[key: string]: any
	$metadata: PropertyMetadata & {
		[key: string]: PropertyMetadata
	}
	$version: number
}

export type DeviceTwin = {
	desired: DeviceTwinState & {
		cfg?: Partial<DeviceConfig>
		gps?: Partial<Gps>
	}
	reported: DeviceTwinState & {
		cfg?: Partial<DeviceConfig>
		gps?: Partial<Gps>
	}
}
