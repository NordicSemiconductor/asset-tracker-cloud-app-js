import { DeviceTwinState } from '../@types/azure-device'
import { ReportedConfigState, ReportedGps } from '../@types/device-state'

export const toReportedWithTime = (state: DeviceTwinState) => {
	const { $metadata } = state
	return {
		cfg: Object.entries(state.cfg).reduce(
			(cfg, [k, v]) => ({
				...cfg,
				[k as keyof ReportedConfigState]: {
					value: v,
					receivedAt: new Date(
						$metadata?.cfg?.[k as keyof ReportedConfigState].$lastUpdated,
					),
				},
			}),
			{} as Partial<ReportedConfigState>,
		),
		gps: Object.entries(state.gps).reduce(
			(gps, [k, v]) => ({
				...gps,
				[k as keyof ReportedGps]: {
					value: v,
					receivedAt: new Date(
						$metadata?.gps?.[k as keyof ReportedGps].$lastUpdated,
					),
				},
			}),
			{} as Partial<ReportedGps>,
		),
	}
}
