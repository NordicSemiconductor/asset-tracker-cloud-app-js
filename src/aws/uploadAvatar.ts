import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { v4 } from 'uuid'

export const uploadAvatar =
	({ s3, bucketName }: { s3: S3Client; bucketName: string }) =>
	async (avatar: Blob): Promise<string> => {
		const id = v4()
		const url = `https://${bucketName}.s3.amazonaws.com/${id}.jpg`
		await s3.send(
			new PutObjectCommand({
				Bucket: `${bucketName}`,
				Key: `${id}.jpg`,
				ContentType: avatar.type,
				ContentLength: avatar.size,
				Body: avatar,
			}),
		)

		return url
	}
