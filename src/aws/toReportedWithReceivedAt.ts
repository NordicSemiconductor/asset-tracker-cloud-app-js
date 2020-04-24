import {
	ThingStateMetadataProperty,
	ReportedThingState,
} from '../@types/aws-device'
import {
	ReportedState,
	MakeReceivedProperty,
	DeviceConfig,
} from '../@types/device-state'

/**
 * AWS meta does not report timestamps for top level arrays or objects, so find the first timestamp in an array or nested object.
 */
const findTimestamp = (o: ThingStateMetadataProperty): number | undefined => {
	if (o.timestamp) return o.timestamp
	if (Array.isArray(o)) {
		return o.map(findTimestamp).pop()
	}
	return Object.values(o).map(findTimestamp).pop()
}

const toReceivedProps = <A extends { [key: string]: any }>(
	v: A,
	meta: ThingStateMetadataProperty,
): MakeReceivedProperty<A> =>
	Object.entries(v).reduce((o, [k, v]) => {
		const ts = findTimestamp(meta[k])
		return {
			...o,
			[k]: {
				value: v,
				receivedAt: new Date(ts ? ts * 1000 : Date.now()),
			},
		}
	}, {} as MakeReceivedProperty<A>)

/**
 * Converts the AWS IoT Thing reported shadow to the generic format used in the app.
 * This is added to support multiple cloud vendors with one app source code.
 */
export const toReportedWithReceivedAt = ({
	reported,
	metadata,
}: {
	reported: ReportedThingState
	metadata: ThingStateMetadataProperty
}): ReportedState => ({
	...(reported.cfg &&
		metadata.reported.cfg && {
			cfg: toReceivedProps(reported.cfg, metadata.reported.cfg) as Partial<
				MakeReceivedProperty<DeviceConfig>
			>,
		}),
	...(reported.gps &&
		metadata.reported.gps && {
			gps: toReceivedProps(reported.gps, metadata.reported.gps),
		}),
	...(reported.bat &&
		metadata.reported.bat && {
			bat: toReceivedProps(reported.bat, metadata.reported.bat),
		}),
	...(reported.roam &&
		metadata.reported.roam && {
			roam: toReceivedProps(reported.roam, metadata.reported.roam),
		}),
	...(reported.dev &&
		metadata.reported.dev && {
			dev: toReceivedProps(reported.dev, metadata.reported.dev),
		}),
	...(reported.acc &&
		metadata.reported.acc && {
			acc: toReceivedProps(reported.acc, metadata.reported.acc),
		}),
})
