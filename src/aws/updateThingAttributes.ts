import { IoTClient, UpdateThingCommand } from '@aws-sdk/client-iot'

export const updateThingAttributes =
	({ iot, thingName }: { iot: IoTClient; thingName: string }) =>
	async (attributes: { [key: string]: string }): Promise<void> => {
		await iot.send(
			new UpdateThingCommand({
				thingName,
				attributePayload: {
					attributes: attributes,
					merge: true,
				},
			}),
		)
	}
