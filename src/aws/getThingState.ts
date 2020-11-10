import { IotData } from 'aws-sdk'
import { ThingState } from '../@types/aws-device'
import { Option, none, some } from 'fp-ts/lib/Option'

export const getThingState = (iotData: IotData) => async (
	deviceId: string,
): Promise<Option<ThingState>> => {
	try {
		const { payload } = await iotData
			.getThingShadow({
				thingName: deviceId,
			})
			.promise()
		if (payload === undefined) return none
		const shadow = JSON.parse(payload.toString())
		if (shadow.state === undefined) return none
		const s = {
			...shadow.state,
			metadata: shadow.metadata,
		}
		return some(s)
	} catch (err) {
		console.error(err)
		return none
	}
}
