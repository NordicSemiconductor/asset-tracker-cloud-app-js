import {
	Battery,
	DeviceConfig,
	DeviceInformation,
	Environment,
	Gnss,
	MakeReceivedProperty,
	ReportedState,
	RoamingInformation,
} from './device-state'

export type AWSDeviceInformation = DeviceInformation & {
	v: {
		appV: string
	}
}

export type ReportedThingState = {
	cfg?: Partial<DeviceConfig>
	gnss?: Gnss
	bat?: Battery
	dev?: AWSDeviceInformation
	roam?: RoamingInformation
	env?: Environment
}

export type ThingStateMetadataProperty = {
	timestamp?: number
	[key: string]: any
}

export type AWSReportedState = ReportedState & {
	dev?: MakeReceivedProperty<AWSDeviceInformation>
}

export type ThingState = {
	reported: ReportedThingState
	desired: {
		cfg?: Partial<DeviceConfig>
	}
	metadata: ThingStateMetadataProperty
}
