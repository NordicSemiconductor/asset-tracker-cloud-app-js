import { Iot, S3 } from 'aws-sdk'

export const deleteUpgradeFirmwareJob = ({
	iot,
	s3,
	bucketName,
}: {
	iot: Iot
	s3: S3
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
			.deleteObject({
				Bucket: bucketName,
				Key: jobId,
			})
			.promise()
			.catch(error => {
				console.error(`Failed to delete firmware file for job ${jobId}`)
				console.error(error)
			}),
		await iot
			.deleteJobExecution({
				jobId,
				thingName: deviceId,
				executionNumber,
			})
			.promise()
			.catch(error => {
				console.error(`Failed to delete job ${jobId}`)
				console.error(error)
			}),
	])
}
