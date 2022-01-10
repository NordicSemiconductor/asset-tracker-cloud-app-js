import {
	AWSReportedState,
	ReportedThingState,
	ThingStateMetadataProperty,
} from '../@types/aws-device'
import { DeviceConfig, MakeReceivedProperty } from '../@types/device-state'

/**
 * AWS meta does not report timestamps for top level arrays or objects, so find the first timestamp in an array or nested object.
 */
const findTimestamp = (o: ThingStateMetadataProperty): number | undefined => {
	if (o.timestamp !== undefined) return o.timestamp
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
				receivedAt: new Date(ts !== undefined ? ts * 1000 : Date.now()),
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
}): AWSReportedState => ({
	...(reported.cfg !== undefined && metadata.reported.cfg !== undefined
		? {
				cfg: toReceivedProps(reported.cfg, metadata.reported.cfg) as Partial<
					MakeReceivedProperty<DeviceConfig>
				>,
		  }
		: undefined),
	...(reported.gnss !== undefined && metadata.reported.gnss !== undefined
		? {
				gnss: toReceivedProps(reported.gnss, metadata.reported.gnss),
		  }
		: undefined),
	...(reported.bat !== undefined && metadata.reported.bat !== undefined
		? {
				bat: toReceivedProps(reported.bat, metadata.reported.bat),
		  }
		: undefined),
	...(reported.roam !== undefined && metadata.reported.roam !== undefined
		? {
				roam: toReceivedProps(reported.roam, metadata.reported.roam),
		  }
		: undefined),
	...(reported.dev !== undefined && metadata.reported.dev !== undefined
		? {
				dev: toReceivedProps(reported.dev, metadata.reported.dev),
		  }
		: undefined),
	...(reported.env !== undefined && metadata.reported.env !== undefined
		? {
				env: toReceivedProps(reported.env, metadata.reported.env),
		  }
		: undefined),
})
