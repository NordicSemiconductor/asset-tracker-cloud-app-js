import { Iot } from 'aws-sdk'
import memoize from 'memoize-one'

export type ThingInfo = {
	thingName: Iot.ThingName
	thingId: Iot.ThingId
	thingArn: Iot.ThingArn
	attributes: Iot.Attributes
	version: Iot.Version
}
export const describeIotThing = ({ iot }: { iot: Iot }) =>
	memoize(
		async (thingName: string) =>
			iot
				.describeThing({
					thingName,
				})
				.promise() as Promise<ThingInfo>,
	)
