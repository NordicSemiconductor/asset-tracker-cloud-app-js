import {
	DeviceTwinReported,
	PropertyMetadata,
	MakePropertyMetadata,
	ReportedFOTAJobProgress,
} from '../@types/azure-device'
import {
	ReportedState,
	MakeReceivedProperty,
	DeviceConfig,
} from '../@types/device-state'

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
): ReportedState & { fota?: ReportedFOTAJobProgress } => {
	const { $metadata } = reported
	return {
		...(reported.cfg &&
			$metadata.cfg && {
				cfg: toReceivedProps(reported.cfg, $metadata.cfg) as Partial<
					MakeReceivedProperty<DeviceConfig>
				>,
			}),
		...(reported.gps &&
			$metadata.gps && { gps: toReceivedProps(reported.gps, $metadata.gps) }),
		...(reported.bat &&
			$metadata.bat && { bat: toReceivedProps(reported.bat, $metadata.bat) }),
		...(reported.roam &&
			$metadata.roam && {
				roam: toReceivedProps(reported.roam, $metadata.roam),
			}),
		...(reported.dev &&
			$metadata.dev && { dev: toReceivedProps(reported.dev, $metadata.dev) }),
		...(reported.acc &&
			$metadata.acc && { acc: toReceivedProps(reported.acc, $metadata.acc) }),
		...(reported.env &&
			$metadata.env && { env: toReceivedProps(reported.env, $metadata.env) }),
		...(reported.fota &&
			$metadata.fota && {
				fota: toReceivedProps(reported.fota, $metadata.fota),
			}),
	}
}
