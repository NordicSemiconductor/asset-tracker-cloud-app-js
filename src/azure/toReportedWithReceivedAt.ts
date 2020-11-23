import {
	DeviceTwinReported,
	PropertyMetadata,
	MakePropertyMetadata,
	AzureReportedState,
} from '../@types/azure-device'
import { MakeReceivedProperty, DeviceConfig } from '../@types/device-state'

export const toReceivedProps = <A extends { [key: string]: any }>(
	v: A,
	meta: PropertyMetadata & MakePropertyMetadata<A>,
): MakeReceivedProperty<A> =>
	Object.entries(v).reduce(
		(o, [k, v]) => ({
			...o,
			[k]: {
				value: v,
				receivedAt: new Date(meta[k].$lastUpdated),
			},
		}),
		{} as MakeReceivedProperty<A>,
	)
/**
 * Converts the Azure reported Twin state to the generic format used in the app.
 * This is added to support multiple cloud vendors with one app source code.
 */
export const toReportedWithReceivedAt = (
	reported: DeviceTwinReported,
): AzureReportedState => {
	const { $metadata } = reported
	return {
		...(reported.cfg !== undefined && $metadata.cfg !== undefined
			? {
					cfg: toReceivedProps(reported.cfg, $metadata.cfg) as Partial<
						MakeReceivedProperty<DeviceConfig>
					>,
			  }
			: undefined),
		...(reported.gps !== undefined && $metadata.gps !== undefined
			? {
					gps: toReceivedProps(reported.gps, $metadata.gps),
			  }
			: undefined),
		...(reported.bat !== undefined && $metadata.bat !== undefined
			? {
					bat: toReceivedProps(reported.bat, $metadata.bat),
			  }
			: undefined),
		...(reported.roam !== undefined && $metadata.roam !== undefined
			? {
					roam: toReceivedProps(reported.roam, $metadata.roam),
			  }
			: undefined),
		...(reported.dev !== undefined && $metadata.dev !== undefined
			? {
					dev: toReceivedProps(reported.dev, $metadata.dev),
			  }
			: undefined),
		...(reported.acc !== undefined && $metadata.acc !== undefined
			? {
					acc: toReceivedProps(reported.acc, $metadata.acc),
			  }
			: undefined),
		...(reported.env !== undefined && $metadata.env !== undefined
			? {
					env: toReceivedProps(reported.env, $metadata.env),
			  }
			: undefined),
		...(reported.firmware !== undefined && $metadata.firmware !== undefined
			? {
					firmware: toReceivedProps(reported.firmware, $metadata.firmware),
			  }
			: undefined),
	}
}
