import {
	AttributeValue,
	DynamoDBClient,
	QueryCommand,
} from '@aws-sdk/client-dynamodb'
import { none, Option, some } from 'fp-ts/lib/Option'
import { NCellMeasReport } from '../@types/device-state'

export const getNeighboringCellMeasurementReport =
	({ dynamoDB, tableName }: { dynamoDB: DynamoDBClient; tableName: string }) =>
	async ({
		deviceId,
	}: {
		deviceId: string
	}): Promise<Option<NCellMeasReport>> => {
		const res = await dynamoDB.send(
			new QueryCommand({
				TableName: tableName,
				KeyConditionExpression: '#deviceId = :deviceId',
				ExpressionAttributeNames: {
					'#deviceId': 'deviceId',
				},
				ExpressionAttributeValues: {
					':deviceId': {
						S: deviceId,
					},
				},
				ScanIndexForward: false,
				Limit: 1,
			}),
		)
		if (res.Items === undefined || res.Items.length === 0) return none
		const reportData = res.Items[0].report.M as {
			[key: string]: AttributeValue
		}
		const report: NCellMeasReport = {
			mcc: parseInt(reportData.mcc.N as string, 10),
			mnc: parseInt(reportData.mnc.N as string, 10),
			cid: parseInt(reportData.cid.N as string, 10),
			tac: parseInt(reportData.tac.N as string, 10),
			earfcn: parseInt(reportData.earfcn.N as string, 10),
			timingAdvance: parseInt(reportData.timingAdvance.N as string, 10),
			age: parseInt(reportData.age.N as string, 10),
			rsrp: parseInt(reportData.rsrp.N as string, 10),
			rsrq: parseInt(reportData.rsrq.N as string, 10),
			nmr: (
				reportData?.nmr?.L as
					| {
							M: {
								[key: string]: AttributeValue
							}
					  }[]
					| undefined
			)?.map(({ M }) => ({
				earfcn: parseInt(M.earfcn.N as string, 10),
				pci: parseInt(M.pci.N as string, 10),
				timeDiff: parseInt(M.timeDiff.N as string, 10),
				rsrp: parseInt(M.rsrp.N as string, 10),
				rsrq: parseInt(M.rsrq.N as string, 10),
			})),
			receivedAt: new Date(parseInt(res.Items[0].timestamp.N as string, 10)),
			reportedAt: new Date(parseInt(reportData.ts.N as string, 10)),
		}
		return some(report)
	}
