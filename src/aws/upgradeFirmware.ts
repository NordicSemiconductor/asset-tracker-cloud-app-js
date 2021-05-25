import {
	CreateJobCommand,
	IoTClient,
	JobExecutionStatus,
} from '@aws-sdk/client-iot'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { v4 } from 'uuid'
import { DeviceUpgradeFirmwareJob } from './listUpgradeFirmwareJobs'

export type FOTAJobDocument = {
	operation: 'app_fw_update'
	size: number
	filename: string
	location: {
		protocol: 'https'
		host: string
		path: string
	}
	fwversion: string
	targetBoard: string
}

export const createJob = async ({
	iot,
	thingArn,
	version,
	targetBoard,
	jobId,
	bucketName,
	file,
}: {
	iot: IoTClient
	thingArn: string
	version: string
	targetBoard: string
	jobId: string
	bucketName: string
	file: {
		size: number
		name: string
	}
}): Promise<DeviceUpgradeFirmwareJob> => {
	const description = `Upgrade ${thingArn.split('/')[1]} to version ${version}.`
	await iot.send(
		new CreateJobCommand({
			jobId,
			targets: [thingArn],
			document: JSON.stringify({
				operation: 'app_fw_update',
				size: file.size,
				filename: file.name,
				location: {
					protocol: 'https',
					host: `${bucketName}.s3.amazonaws.com`,
					path: `${jobId}`,
				},
				fwversion: version,
				targetBoard,
			} as FOTAJobDocument),
			description,
			targetSelection: 'SNAPSHOT',
		}),
	)

	return {
		jobId,
		description,
		status: JobExecutionStatus.QUEUED,
		document: {
			size: file.size,
			fwversion: version,
			filename: file.name,
			targetBoard,
			location: `https://${bucketName}.s3.amazonaws.com/${jobId}`,
		},
		queuedAt: new Date(),
		executionNumber: 0,
	}
}

export const upgradeFirmware =
	({
		s3,
		iot,
		bucketName,
	}: {
		s3: S3Client
		iot: IoTClient
		bucketName: string
	}) =>
	async ({
		file,
		thingArn,
		version,
		targetBoard,
	}: {
		file: File
		thingArn: string
		version: string
		targetBoard: string
	}): Promise<DeviceUpgradeFirmwareJob> => {
		const jobId = v4()
		const data = await new Promise<Buffer>((resolve) => {
			const reader = new FileReader()
			reader.onload = (e: any) => resolve(e.target.result)
			reader.readAsArrayBuffer(file)
		})
		await s3.send(
			new PutObjectCommand({
				Bucket: bucketName,
				Key: jobId,
				Body: data,
				ContentLength: file.size,
				ContentType: 'text/octet-stream',
			}),
		)

		return createJob({
			iot,
			file,
			thingArn,
			version,
			targetBoard,
			jobId,
			bucketName,
		})
	}
