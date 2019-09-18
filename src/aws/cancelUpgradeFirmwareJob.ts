import { Iot } from 'aws-sdk'

export const cancelUpgradeFirmwareJob = ({ iot }: { iot: Iot }) => async ({
	jobId,
	deviceId,
}: {
	deviceId: string
	jobId: string
}): Promise<void> => {
	await iot
		.cancelJobExecution({
			jobId,
			thingName: deviceId,
		})
		.promise()
}
