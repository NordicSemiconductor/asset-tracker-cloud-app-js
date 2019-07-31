const merge = (
	reported: { [key: string]: any },
	metadata: { [key: string]: any },
): { [key: string]: any } => {
	if (Array.isArray(reported)) {
		return reported.map((v, k) => merge(v, metadata[k]))
	} else if (typeof reported === 'object') {
		// reported
		return Object.entries(reported).reduce(
			(result, entry) => ({
				...result,
				[entry[0]]: merge(entry[1], metadata[entry[0]]),
			}),
			{},
		)
	} else {
		return {
			value: reported,
			receivedAt: new Date((metadata.timestamp as number) * 1000),
		}
	}
}

/**
 * This merges the reported state and the metadata into one object
 */
export const mergeReportedAndMetadata = ({
	shadow,
}: {
	shadow: { [key: string]: any }
}): { [key: string]: any } =>
	!shadow.state.reported
		? {}
		: merge(shadow.state.reported, shadow.metadata.reported)
