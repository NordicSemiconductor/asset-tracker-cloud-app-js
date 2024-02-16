import {
	AzureReportedState,
	DeviceTwinReported,
	MakePropertyMetadata,
	PropertyMetadata,
} from '../@types/azure-device'
import { DeviceConfig, MakeReceivedProperty } from '../@types/device-state'

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
		...(reported.gnss !== undefined && $metadata.gnss !== undefined
			? {
					gnss: toReceivedProps(reported.gnss, $metadata.gnss),
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
