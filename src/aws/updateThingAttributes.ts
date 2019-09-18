import { Iot } from 'aws-sdk'

export const updateThingAttributes = ({
	iot,
	thingName,
}: {
	iot: Iot
	thingName: string
}) => async (attributes: { [key: string]: string }): Promise<void> => {
	await iot
		.updateThing({
			thingName,
			attributePayload: {
				attributes: attributes,
				merge: true,
			},
		})
		.promise()
}
