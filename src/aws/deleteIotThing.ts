import {
	DeleteCertificateCommand,
	DeleteThingCommand,
	DetachThingPrincipalCommand,
	IoTClient,
	ListThingPrincipalsCommand,
	UpdateCertificateCommand,
} from '@aws-sdk/client-iot'

export const deleteIotThing = ({ iot }: { iot: IoTClient }) => async (
	thingName: string,
): Promise<void> => {
	const { principals } = await iot.send(
		new ListThingPrincipalsCommand({ thingName }),
	)
	await Promise.all(
		(principals ?? []).map(async (certificateArn) => {
			const certificateId = certificateArn.split('/')[1]
			await Promise.all([
				iot.send(
					new DetachThingPrincipalCommand({
						thingName,
						principal: certificateArn,
					}),
				),
				iot.send(
					new UpdateCertificateCommand({
						certificateId,
						newStatus: 'INACTIVE',
					}),
				),
			])
			await iot.send(
				new DeleteCertificateCommand({
					certificateId,
				}),
			)
		}),
	)
	await iot.send(
		new DeleteThingCommand({
			thingName,
		}),
	)
}
