import {
	IoTDataPlaneClient,
	GetThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { ThingState } from '../@types/aws-device'
import { Option, none, some } from 'fp-ts/lib/Option'

export const getThingState = (iotData: IoTDataPlaneClient) => async (
	deviceId: string,
): Promise<Option<ThingState>> => {
	try {
		const { payload } = await iotData.send(
			new GetThingShadowCommand({
				thingName: deviceId,
			}),
		)

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
