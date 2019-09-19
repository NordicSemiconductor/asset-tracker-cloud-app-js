import { Iot } from 'aws-sdk'
import memoize from 'memoize-one'

export type ThingInfo = {
	thingName: Iot.ThingName
	thingId: Iot.ThingId
	thingArn: Iot.ThingArn
	attributes: Iot.Attributes
	version: Iot.Version
}
export type describeCatIotThing = (args: {
	catId: string
}) => Promise<ThingInfo>

export const describeCatIotThing = ({ iot }: { iot: Iot }) =>
	memoize(
		async ({ catId }: { catId: string }) =>
			iot
				.describeThing({
					thingName: catId,
				})
				.promise() as Promise<ThingInfo>,
	)
