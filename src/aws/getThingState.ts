import { IotData } from 'aws-sdk'
import { mergeReportedAndMetadata } from './mergeReportedAndMetadata'
import { ThingState } from '../@types/aws-device'
import { DeviceConfig } from '../@types/device-state'

export const getThingState = (iotData: IotData) => async (
	deviceId: string,
): Promise<ThingState> => {
	try {
		const { payload } = await iotData
			.getThingShadow({
				thingName: deviceId,
			})
			.promise()
		if (!payload) return {}
		const shadow = JSON.parse(payload.toString())

		if (!shadow.state) return {}
		const reported = mergeReportedAndMetadata({
			reported: shadow.state?.reported,
			metadata: shadow.metadata?.reported,
		})
		console.log('[reported]', reported)
		const desired = shadow.state.desired as {
			cfg?: Partial<DeviceConfig>
		}
		console.log('[desired]', desired)
		return {
			reported,
			desired,
		} as ThingState
	} catch (err) {
		console.error(err)
		return {}
	}
}
