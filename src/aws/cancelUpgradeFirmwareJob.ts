import { Iot } from 'aws-sdk'

export const cancelUpgradeFirmwareJob = ({ iot }: { iot: Iot }) => async ({
	jobId,
	force,
	deviceId,
}: {
	deviceId: string
	force: boolean
	jobId: string
}): Promise<void> => {
	await iot
		.cancelJobExecution({
			jobId,
			force,
			thingName: deviceId,
		})
		.promise()
}
