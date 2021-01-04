import { DeleteJobExecutionCommand, IoTClient } from '@aws-sdk/client-iot'
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'

export const deleteUpgradeFirmwareJob = ({
	iot,
	s3,
	bucketName,
}: {
	iot: IoTClient
	s3: S3Client
	bucketName: string
}) => async ({
	jobId,
	deviceId,
	executionNumber,
}: {
	deviceId: string
	jobId: string
	executionNumber: number
}): Promise<void> => {
	await Promise.all([
		await s3
			.send(
				new DeleteObjectCommand({
					Bucket: bucketName,
					Key: jobId,
				}),
			)
			.catch((error) => {
				console.error(`Failed to delete firmware file for job ${jobId}`)
				console.error(error)
			}),
		await iot
			.send(
				new DeleteJobExecutionCommand({
					jobId,
					thingName: deviceId,
					executionNumber,
				}),
			)
			.catch((error) => {
				console.error(`Failed to delete job ${jobId}`)
				console.error(error)
			}),
	])
}
