import {
	AttachPrincipalPolicyCommand,
	IoTClient,
	ListPrincipalPoliciesCommand,
} from '@aws-sdk/client-iot'

export const attachIotPolicyToIdentity =
	({ iot, policyName }: { iot: IoTClient; policyName: string }) =>
	async (identityId: string): Promise<void> => {
		const { policies } = await iot.send(
			new ListPrincipalPoliciesCommand({
				principal: identityId,
			}),
		)

		if ((policies?.length ?? 0) > 0) {
			return
		}
		await iot.send(
			new AttachPrincipalPolicyCommand({
				principal: identityId,
				policyName,
			}),
		)
	}
