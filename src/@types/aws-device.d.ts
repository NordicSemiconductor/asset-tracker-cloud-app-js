import { MergedReportedState } from '../aws/toReportedWithReceivedAt'
import {
	DeviceConfig,
	Gps,
	Battery,
	DeviceInformation,
	RoamingInformation,
	Accelerometer,
	Environment,
} from './device-state'

export type ReportedThingState = {
	cfg?: Partial<DeviceConfig>
	gps?: Gps
	bat?: Battery
	dev?: DeviceInformation
	roam?: RoamingInformation
	acc?: Accelerometer
	env?: Environment
}
export type ThingState = {
	reported: ReportedThingState
	desired: {
		cfg?: Partial<DeviceConfig>
	}
	metadata: ThingStateMetadataProperty
}

export type ThingStateMetadataProperty = {
	timestamp?: number
} & {
	[key: string]: ThingStateMetadataProperty
}
