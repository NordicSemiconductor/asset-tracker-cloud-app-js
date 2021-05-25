import {
	DescribeJobCommand,
	GetJobDocumentCommand,
	IoTClient,
	ListJobExecutionsForThingCommand,
	JobExecutionSummary,
	JobExecutionStatus,
	Job,
} from '@aws-sdk/client-iot'
import { paginate } from '../util/paginate'

export type DeviceUpgradeFirmwareJob = {
	jobId: string
	description: string
	status: JobExecutionStatus
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

export const listUpgradeFirmwareJobs =
	({ iot }: { iot: IoTClient }) =>
	async (deviceId: string): Promise<DeviceUpgradeFirmwareJob[]> =>
		paginate<DeviceUpgradeFirmwareJob>({
			paginator: async (startKey) => {
				const { executionSummaries, nextToken } = await iot.send(
					new ListJobExecutionsForThingCommand({
						thingName: deviceId,
						nextToken: startKey,
					}),
				)

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
								iot.send(new DescribeJobCommand({ jobId: `${jobId}` })),
								iot.send(new GetJobDocumentCommand({ jobId: `${jobId}` })),
							])
							const {
								status,
								queuedAt,
								startedAt,
								lastUpdatedAt,
								executionNumber,
							} = jobExecutionSummary as JobExecutionSummary

							const {
								size,
								fwversion,
								targetBoard,
								filename,
								location: { protocol, host, path },
							} = JSON.parse(document as string)

							return {
								jobId: `${jobId}`,
								description: `${(job as Job).description}`,
								status: status as JobExecutionStatus,
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
