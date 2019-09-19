import { Iot } from 'aws-sdk'

export const attachIotPolicyToIdentity = ({
	iot,
	policyName,
}: {
	iot: Iot
	policyName: string
}) => async (identityId: string) =>
	iot
		.listPrincipalPolicies({
			principal: identityId,
		})
		.promise()
		.then(async ({ policies }) => {
			if (policies && policies.length) {
				return
			}
			return iot
				.attachPrincipalPolicy({
					principal: identityId,
					policyName,
				})
				.promise()
				.then(() => undefined)
		})
