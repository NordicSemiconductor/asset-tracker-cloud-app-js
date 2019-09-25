import { IotData } from 'aws-sdk'
import { DesiredConfig } from '../Settings/Settings'

export const updateThingConfig = (iotData: IotData) => (
	deviceId: string,
) => async (config: Partial<DesiredConfig>) => {
	await iotData
		.updateThingShadow({
			thingName: deviceId,
			payload: JSON.stringify({
				state: {
					desired: {
						cfg: config,
					},
				},
			}),
		})
		.promise()
}
