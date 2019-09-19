import { Iot } from 'aws-sdk'

export const deleteIotThing = ({ iot }: { iot: Iot }) => async (
	thingName: string,
) => {
	const { principals } = await iot.listThingPrincipals({ thingName }).promise()
	await Promise.all(
		(principals || []).map(async certificateArn => {
			const certificateId = certificateArn.split('/')[1]
			await Promise.all([
				iot
					.detachThingPrincipal({
						thingName,
						principal: certificateArn,
					})
					.promise(),
				iot
					.updateCertificate({
						certificateId,
						newStatus: 'INACTIVE',
					})
					.promise(),
			])
			await iot
				.deleteCertificate({
					certificateId,
				})
				.promise()
		}),
	)
	await iot
		.deleteThing({
			thingName,
		})
		.promise()
}
