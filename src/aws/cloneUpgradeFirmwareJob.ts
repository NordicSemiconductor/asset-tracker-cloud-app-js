import { CopyObjectCommand, S3Client } from '@aws-sdk/client-s3'
import {
	DescribeJobCommand,
	GetJobDocumentCommand,
	IoTClient,
} from '@aws-sdk/client-iot'
import { v4 } from 'uuid'
import { DeviceUpgradeFirmwareJob } from './listUpgradeFirmwareJobs'
import { createJob, FOTAJobDocument } from './upgradeFirmware'

export const cloneUpgradeFirmwareJob = ({
	iot,
	s3,
	bucketName,
}: {
	iot: IoTClient
	s3: S3Client
	bucketName: string
}) => async ({
	jobId,
	thingArn,
}: {
	thingArn: string
	jobId: string
}): Promise<DeviceUpgradeFirmwareJob> => {
	const [{ job }, document] = await Promise.all([
		iot.send(
			new DescribeJobCommand({
				jobId,
			}),
		),
		iot
			.send(new GetJobDocumentCommand({ jobId }))
			.then(
				({ document }) => JSON.parse(document as string) as FOTAJobDocument,
			),
	])

	if (job === undefined || document === undefined)
		throw new Error(`Unknown job: ${jobId}!`)

	const newJobId = v4()

	await s3.send(
		new CopyObjectCommand({
			Bucket: bucketName,
			Key: newJobId,
			CopySource: `${bucketName}/${jobId}`,
		}),
	)

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
