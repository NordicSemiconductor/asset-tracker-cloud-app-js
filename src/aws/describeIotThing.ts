import { DescribeThingCommand, IoTClient } from '@aws-sdk/client-iot'
import memoize from 'memoize-one'

export const describeIotThing = ({
	iot,
}: {
	iot: IoTClient
}): ((thingName: string) => Promise<{
	thingName: string
	thingArn: string
	version: number
	attributes: Record<string, string>
}>) =>
	memoize(async (thingName: string) => {
		const res = await iot.send(
			new DescribeThingCommand({
				thingName,
			}),
		)
		return {
			thingName: res.thingName as string,
			thingArn: res.thingArn as string,
			attributes: res.attributes as Record<string, string>,
			version: res.version as number,
		}
	})
