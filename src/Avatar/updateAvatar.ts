import { Iot, S3 } from 'aws-sdk'
import { v4 } from 'uuid'

export const updateAvatar = ({
	s3,
	iot,
	bucketName,
	thingName,
}: {
	s3: S3
	iot: Iot
	bucketName: string
	thingName: string
}) => async ({ blob }: { blob: Blob }): Promise<{ url: string }> => {
	const id = v4()
	const url = `https://${bucketName}.s3.amazonaws.com/${id}.jpg`
	await s3
		.putObject({
			Bucket: `${bucketName}`,
			Key: `${id}.jpg`,
			ContentType: blob.type,
			ContentLength: blob.size,
			Body: blob,
		})
		.promise()

	await iot
		.updateThing({
			thingName,
			attributePayload: {
				attributes: {
					avatar: url,
				},
				merge: true,
			},
		})
		.promise()

	return { url }
}
