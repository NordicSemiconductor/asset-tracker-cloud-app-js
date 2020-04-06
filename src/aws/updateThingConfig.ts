import { IotData } from 'aws-sdk'
import { DeviceConfig } from '../@types/device-state'

export const updateThingConfig = (iotData: IotData) => (
	deviceId: string,
) => async (config: Partial<DeviceConfig>) => {
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
