import { Iot } from 'aws-sdk'

export const attachIotPolicyToIdentity = ({
	iot,
	policyName,
}: {
	iot: Iot
	policyName: string
}) => async (identityId: string): Promise<void> => {
	const { policies } = await iot
		.listPrincipalPolicies({
			principal: identityId,
		})
		.promise()
	if ((policies?.length ?? 0) > 0) {
		return
	}
	await iot
		.attachPrincipalPolicy({
			principal: identityId,
			policyName,
		})
		.promise()
}
