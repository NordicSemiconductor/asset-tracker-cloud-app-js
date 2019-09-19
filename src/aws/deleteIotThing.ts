import { Iot } from 'aws-sdk'

export const deleteThing = ({ iot }: { iot: Iot }) => async (catId: string) =>
	iot
		.deleteThing({
			thingName: catId,
		})
		.promise()
