import { Iot, S3 } from 'aws-sdk'
import { v4 } from 'uuid'
import { DeviceUpgradeFirmwareJob } from './listUpgradeFirmwareJobs'
import { createJob, FOTAJobDocument } from './upgradeFirmware'

export const cloneUpgradeFirmwareJob = ({
	iot,
	s3,
	bucketName,
}: {
	iot: Iot
	s3: S3
	bucketName: string
}) => async ({
	jobId,
	thingArn,
}: {
	thingArn: string
	jobId: string
}): Promise<DeviceUpgradeFirmwareJob> => {
	const [{ job }, document] = await Promise.all([
		iot
			.describeJob({
				jobId,
			})
			.promise(),
		iot
			.getJobDocument({ jobId })
			.promise()
			.then(
				({ document }) => JSON.parse(document as string) as FOTAJobDocument,
			),
	])

	if (job === undefined || document === undefined)
		throw new Error(`Unknown job: ${jobId}!`)

	const newJobId = v4()

	await s3
		.copyObject({
			Bucket: bucketName,
			Key: newJobId,
			CopySource: `${bucketName}/${jobId}`,
		})
		.promise()

	return createJob({
		iot,
		file: {
			size: document.size,
			name: document.filename,
		},
		thingArn,
		version: document.fwversion,
		targetBoard: document.targetBoard,
		jobId: newJobId,
		bucketName,
	})
}
