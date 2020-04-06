import { ThingStateMetadataProperty } from '../@types/aws-device'

type MakeReadOnly<Type> = {
	readonly [Key in keyof Type]: MakeReadOnly<Type[Key]>
}

type M = {
	value: any
	receivedAt: Date
}
export type MergedReportedState =
	| MakeReadOnly<M>
	| MakeReadOnly<{ [key: string]: M }>
	| MergedReportedState[]

const merge = (
	reported: { [key: string]: any },
	metadata: { [key: string]: any },
): MergedReportedState => {
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
	reported,
	metadata,
}: {
	reported: { [key: string]: any }
	metadata: ThingStateMetadataProperty
}) => {
	console.log({
		reported,
		metadata,
	})
	return merge(reported, metadata)
}
