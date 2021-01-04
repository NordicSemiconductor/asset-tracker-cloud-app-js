import { CancelJobExecutionCommand, IoTClient } from '@aws-sdk/client-iot'

export const cancelUpgradeFirmwareJob = ({
	iot,
}: {
	iot: IoTClient
}) => async ({
	jobId,
	force,
	deviceId,
}: {
	deviceId: string
	force: boolean
	jobId: string
}): Promise<void> => {
	await iot.send(
		new CancelJobExecutionCommand({
			jobId,
			force,
			thingName: deviceId,
		}),
	)
}
