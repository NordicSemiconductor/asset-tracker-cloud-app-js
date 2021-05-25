import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { DeviceConfig } from '../@types/device-state'
import { fromUtf8 } from '@aws-sdk/util-utf8-browser'

export const updateThingConfig =
	(iotData: IoTDataPlaneClient) =>
	(deviceId: string) =>
	async (config: Partial<DeviceConfig>): Promise<void> => {
		await iotData.send(
			new UpdateThingShadowCommand({
				thingName: deviceId,
				payload: fromUtf8(
					JSON.stringify({
						state: {
							desired: {
								cfg: config,
							},
						},
					}),
				),
			}),
		)
	}
