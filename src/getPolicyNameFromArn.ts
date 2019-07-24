export const getPolicyNameFromArn = (policyArn: string): string =>
	policyArn.split('/')[1] || ''
