import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { none, Option, some } from 'fp-ts/lib/Option'
import { NCellMeasReport } from '../@types/device-state'
import { unmarshall } from '@aws-sdk/util-dynamodb'

export const getNeighboringCellMeasurementReport =
	({ dynamoDB, tableName }: { dynamoDB: DynamoDBClient; tableName: string }) =>
	async ({
		deviceId,
		limit,
	}: {
		deviceId: string
		limit?: number
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
				Limit: limit ?? 1,
			}),
		)
		if (res.Items === undefined || res.Items.length === 0) return none
		const report = unmarshall(res.Items[0]) as {
			reportId: string
			roam: {
				v: {
					nw: string
				}
			}
			deviceId: string
			report: {
				area: number
				adv: number
				nmr: {
					rsrp: number
					cell: number
					rsrq: number
					earfcn: number
				}[]
				mnc: number
				rsrq: number
				rsrp: number
				mcc: number
				cell: number
				earfcn: number
				ts: number
			}
			timestamp: number
			unresolved?: boolean
			lat?: number
			lng?: number
			accuracy?: number
		}
		console.log(report)
		return some({
			reportId: report.reportId,
			mcc: report.report.mcc,
			mnc: report.report.mnc,
			cell: report.report.cell,
			area: report.report.area,
			earfcn: report.report.earfcn,
			adv: report.report.adv,
			rsrp: report.report.rsrp,
			rsrq: report.report.rsrq,
			nmr: report.report.nmr,
			reportedAt: new Date(report.timestamp),
			receivedAt: new Date(report.report.ts),
			position:
				report.lat !== undefined &&
				report.lng !== undefined &&
				report.accuracy !== undefined
					? {
							lat: report.lat,
							lng: report.lng,
							accuracy: report.accuracy,
					  }
					: undefined,
		})
	}
