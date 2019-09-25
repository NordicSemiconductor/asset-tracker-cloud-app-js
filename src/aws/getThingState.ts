import { IotData } from 'aws-sdk'
import { mergeReportedAndMetadata } from '../util/mergeReportedAndMetadata'
import { DesiredConfig } from '../Settings/Settings'
import { AWSIotThingState } from './connectAndListenForStateChange'

export const getThingState = (iotData: IotData) => async (
	deviceId: string,
): Promise<AWSIotThingState> => {
	try {
		const { payload } = await iotData
			.getThingShadow({
				thingName: deviceId,
			})
			.promise()
		if (!payload) return {}
		const shadow = JSON.parse(payload.toString())

		if (!shadow.state) return {}
		const reported = mergeReportedAndMetadata({ shadow })
		console.log('[reported]', reported)
		const desired = shadow.state.desired as {
			cfg?: DesiredConfig
		}
		console.log('[desired]', desired)
		return {
			reported,
			desired,
		}
	} catch (err) {
		console.error(err)
		return {}
	}
}
