import { Iot, S3 } from 'aws-sdk'
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
	iot: Iot
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
	const description = `Update ${thingArn.split('/')[1]} to version ${version}.`
	await iot
		.createJob({
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
		})
		.promise()
	return {
		jobId,
		description,
		status: 'QUEUED',
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

export const upgradeFirmware = ({
	s3,
	iot,
	bucketName,
}: {
	s3: S3
	iot: Iot
	bucketName: string
}) => async ({
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
	const data = await new Promise<ArrayBuffer>((resolve) => {
		const reader = new FileReader()
		reader.onload = (e: any) => resolve(e.target.result)
		reader.readAsArrayBuffer(file)
	})
	await s3
		.putObject({
			Bucket: bucketName,
			Key: jobId,
			Body: data,
			ContentLength: file.size,
			ContentType: 'text/octet-stream',
		})
		.promise()

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
