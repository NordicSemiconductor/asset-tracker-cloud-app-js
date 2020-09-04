import { Iot } from 'aws-sdk'
import { paginate } from '../util/paginate'

export type DeviceUpgradeFirmwareJob = {
	jobId: string
	description: string
	status: Iot.JobExecutionStatus
	executionNumber: number
	document: {
		size: number
		fwversion: string
		targetBoard: string
		location: string
		filename: string
	}
	queuedAt?: Date
	startedAt?: Date
	lastUpdatedAt?: Date
}

export const listUpgradeFirmwareJobs = ({ iot }: { iot: Iot }) => async (
	deviceId: string,
): Promise<DeviceUpgradeFirmwareJob[]> =>
	paginate<DeviceUpgradeFirmwareJob>({
		paginator: async (startKey) => {
			const { executionSummaries, nextToken } = await iot
				.listJobExecutionsForThing({
					thingName: deviceId,
					nextToken: startKey,
				})
				.promise()
			if (executionSummaries === undefined || executionSummaries === null) {
				return {
					items: [],
					startKey: nextToken,
				}
			}
			return {
				items: await Promise.all(
					executionSummaries.map(async ({ jobId, jobExecutionSummary }) => {
						const [{ job }, { document }] = await Promise.all([
							iot.describeJob({ jobId: `${jobId}` }).promise(),
							iot.getJobDocument({ jobId: `${jobId}` }).promise(),
						])
						const {
							status,
							queuedAt,
							startedAt,
							lastUpdatedAt,
							executionNumber,
						} = jobExecutionSummary as Iot.JobExecutionSummary

						const {
							size,
							fwversion,
							targetBoard,
							filename,
							location: { protocol, host, path },
						} = JSON.parse(document as string)

						return {
							jobId: `${jobId}`,
							description: `${(job as Iot.Job).description}`,
							status: status as Iot.JobExecutionStatus,
							queuedAt: queuedAt,
							startedAt: startedAt,
							lastUpdatedAt: lastUpdatedAt,
							document: {
								size,
								fwversion,
								targetBoard,
								location: `${protocol}://${host}/${path}`,
								filename,
							},
							executionNumber: executionNumber as number,
						}
					}),
				),
				startKey: nextToken,
			}
		},
	})
