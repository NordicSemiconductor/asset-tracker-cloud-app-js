import { S3 } from 'aws-sdk'
import { v4 } from 'uuid'

export const uploadAvatar = ({
	s3,
	bucketName,
}: {
	s3: S3
	bucketName: string
}) => async ({ avatar }: { avatar: Blob }): Promise<{ url: string }> => {
	const id = v4()
	const url = `https://${bucketName}.s3.amazonaws.com/${id}.jpg`
	await s3
		.putObject({
			Bucket: `${bucketName}`,
			Key: `${id}.jpg`,
			ContentType: avatar.type,
			ContentLength: avatar.size,
			Body: avatar,
		})
		.promise()

	return { url }
}
