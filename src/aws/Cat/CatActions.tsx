import React, { useState } from 'react'
import {
	CredentialsConsumer,
	IotConsumer,
	TimestreamQueryConsumer,
	StackConfigConsumer,
} from '../App'
import { Alert } from 'reactstrap'
import { S3Client } from '@aws-sdk/client-s3'
import { uploadAvatar } from '../uploadAvatar'
import { updateThingAttributes } from '../updateThingAttributes'
import { HistoricalDataChart } from '../../HistoricalData/HistoricalDataChart'
import { Collapsable } from '../../Collapsable/Collapsable'
import { HistoricalDataLoader } from '../HistoricalData/HistoricalDataLoader'
import { emojify } from '../../Emojify/Emojify'
import { describeIotThing } from '../describeIotThing'
import { upgradeFirmware } from '../upgradeFirmware'
import { listUpgradeFirmwareJobs } from '../listUpgradeFirmwareJobs'
import { cancelUpgradeFirmwareJob } from '../cancelUpgradeFirmwareJob'
import { deleteUpgradeFirmwareJob } from '../deleteUpgradeFirmwareJob'
import { cloneUpgradeFirmwareJob } from '../cloneUpgradeFirmwareJob'
import { DeleteCat } from '../../Cat/DeleteCat'
import { deleteIotThing } from '../deleteIotThing'
import { connectAndListenForStateChange } from '../connectAndListenForStateChange'
import { getThingState } from '../getThingState'
import { updateThingConfig } from '../updateThingConfig'
import { Cat } from './Cat'
import { CatMap } from './CatMap'
import { HistoricalButtonPresses } from '../../HistoricalButtonPresses/HistoricalButtonPresses'
import { CatLoader } from '../../Cat/CatLoader'
import { left, right } from 'fp-ts/lib/Either'
import { HttpRequest } from '@aws-sdk/protocol-http'
import { dbmToRSRP } from '@nordicsemiconductor/rsrp-bar'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { getNeighboringCellMeasurementReport } from '../getNeighboringCellMeasurementReport'
import { NeighborCellMeasurementsReport } from '../../DeviceInformation/NeighborCellMeasurementsReport'

export const CatActions = ({ catId }: { catId: string }) => {
	const [deleted, setDeleted] = useState(false)

	if (deleted) {
		return (
			<Alert color={'success'}>
				The cat <code>{catId}</code> has been deleted.
			</Alert>
		)
	}

	return (
		<StackConfigConsumer>
			{({
				region,
				avatarBucketName,
				fotaBucketName,
				geolocationApiEndpoint,
				neighboringCellGeolocationApiEndpoint,
				nCellMeasReportTableName,
			}) => (
				<TimestreamQueryConsumer>
					{(timestreamQueryContext) => (
						<CredentialsConsumer>
							{(credentials) => (
								<IotConsumer>
									{({ iot, iotData, mqttEndpoint }) => {
										const s3 = new S3Client({
											credentials,
											region,
										})
										// FIXME: remove when https://github.com/aws/aws-sdk-js-v3/issues/1800 is fixed
										s3.middlewareStack.add(
											(next) => async (args) => {
												delete (args.request as HttpRequest).headers[
													'content-type'
												]
												return next(args)
											},
											{ step: 'build' },
										)

										const avatarUploader = uploadAvatar({
											s3,
											bucketName: avatarBucketName,
										})
										const attributeUpdater = updateThingAttributes({
											iot,
											thingName: catId,
										})

										const createUpgradeJob = upgradeFirmware({
											s3,
											bucketName: fotaBucketName,
											iot,
										})

										const listUpgradeJobs = listUpgradeFirmwareJobs({
											iot,
										})

										const cancelUpgradeJob = cancelUpgradeFirmwareJob({
											iot,
										})

										const deleteUpgradeJob = deleteUpgradeFirmwareJob({
											s3,
											bucketName: fotaBucketName,
											iot,
										})

										const cloneUpgradeJob = cloneUpgradeFirmwareJob({
											s3,
											bucketName: fotaBucketName,
											iot,
										})

										const describeThing = describeIotThing({ iot })

										const deleteCat = deleteIotThing({ iot })

										const getNcellmeas = getNeighboringCellMeasurementReport({
											dynamoDB: new DynamoDBClient({
												credentials,
												region,
											}),
											tableName: nCellMeasReportTableName,
										})

										return (
											<CatLoader<{
												// TODO: this report is a bug.
												// eslint-disable-next-line no-restricted-globals
												name?: string
												avatar?: string
												version: number
											}>
												catId={catId}
												loader={async (catId) =>
													describeThing(catId).then(
														({ thingName, attributes, version }) => {
															if (thingName) {
																return right({
																	name: attributes?.name,
																	avatar: attributes?.avatar,
																	version: version ?? 0,
																})
															}
															return left({
																type: 'EntityNotFound',
																message: `Failed to describe IoT Thing for cat ${catId}`,
															})
														},
													)
												}
											>
												{(cat, update) => {
													return (
														<Cat
															cat={cat}
															credentials={credentials}
															getThingState={async () =>
																getThingState(iotData)(catId)
															}
															listenForStateChange={async ({ onNewState }) =>
																connectAndListenForStateChange({
																	clientId: `user-${
																		credentials.identityId
																	}-${Date.now()}`,
																	credentials,
																	deviceId: catId,
																	onNewState,
																	region,
																	mqttEndpoint,
																}).then((connection) => () => connection.end())
															}
															updateDeviceConfig={async (cfg) =>
																updateThingConfig(iotData)(catId)(cfg).then(
																	() => {
																		update({
																			...cat,
																			version: ++cat.version,
																		})
																	},
																)
															}
															listUpgradeJobs={async () =>
																listUpgradeJobs(catId)
															}
															cancelUpgradeJob={async ({
																jobId,
																force,
															}: {
																jobId: string
																force: boolean
															}) =>
																cancelUpgradeJob({
																	deviceId: catId,
																	jobId,
																	force,
																})
															}
															deleteUpgradeJob={async ({
																jobId,
																executionNumber,
															}: {
																jobId: string
																executionNumber: number
															}) =>
																deleteUpgradeJob({
																	deviceId: catId,
																	jobId,
																	executionNumber,
																})
															}
															cloneUpgradeJob={async ({
																jobId,
															}: {
																jobId: string
															}) =>
																describeThing(catId).then(
																	async ({ thingArn }) =>
																		cloneUpgradeJob({
																			thingArn,
																			jobId,
																		}),
																)
															}
															onCreateUpgradeJob={async (args) =>
																describeThing(catId).then(
																	async ({ thingArn }) =>
																		createUpgradeJob({
																			...args,
																			thingArn: thingArn,
																		}),
																)
															}
															onAvatarChange={(avatar) => {
																// Display image directly
																const reader = new FileReader()
																reader.onload = (e: any) => {
																	update({
																		...cat,
																		avatar: e.target.result,
																	})
																}
																reader.readAsDataURL(avatar)

																avatarUploader(avatar)
																	.then(async (url) =>
																		attributeUpdater({ avatar: url }),
																	)
																	.catch(console.error)
															}}
															onNameChange={(name) => {
																attributeUpdater({ name }).catch(console.error)
															}}
															catMap={(state) => (
																<CatMap
																	timestreamQueryContext={
																		timestreamQueryContext
																	}
																	cat={cat}
																	state={state}
																	geolocationApiEndpoint={
																		geolocationApiEndpoint
																	}
																	neighboringCellGeolocationApiEndpoint={
																		neighboringCellGeolocationApiEndpoint
																	}
																	getNeighboringCellMeasurementReport={async () =>
																		getNcellmeas({ deviceId: cat.id })
																	}
																/>
															)}
														>
															<hr />
															<Collapsable
																id={'cat:ncell'}
																title={
																	<h3>
																		{emojify('🗧 Neighboring Cell Measurement')}
																	</h3>
																}
															>
																<NeighborCellMeasurementsReport
																	getNeighboringCellMeasurementReport={async () =>
																		getNcellmeas({ deviceId: cat.id })
																	}
																/>
															</Collapsable>
															<hr />
															<Collapsable
																id={'cat:roam'}
																title={<h3>{emojify('📶 RSRP')}</h3>}
															>
																<HistoricalDataLoader<{
																	date: Date
																	value: number
																}>
																	timestreamQueryContext={
																		timestreamQueryContext
																	}
																	deviceId={catId}
																	QueryString={(table) => `
																		SELECT
																		time as date,
																		-measure_value::double as value
																		FROM ${table}
																		WHERE deviceId='${catId}' 
																		AND measure_name='roam.rsrp'
																		ORDER BY time DESC
																		LIMIT 100
																	`}
																>
																	{({ data }) => (
																		<HistoricalDataChart
																			data={data.map(({ value, date }) => ({
																				date,
																				value: -dbmToRSRP(value),
																			}))}
																			type={'line'}
																			max={-70}
																		/>
																	)}
																</HistoricalDataLoader>
															</Collapsable>
															<hr />
															<Collapsable
																id={'cat:bat'}
																title={<h3>{emojify('🔋 Battery')}</h3>}
															>
																<HistoricalDataLoader<{
																	date: Date
																	value: number
																}>
																	timestreamQueryContext={
																		timestreamQueryContext
																	}
																	deviceId={catId}
																	QueryString={(table) => `
																		SELECT
																		bin(time, 1h) as date,
																		MIN(
																			measure_value::double
																		) / 1000 AS value
																		FROM ${table}
																		WHERE deviceId='${catId}' 
																		AND measure_name='bat' 
																		GROUP BY bin(time, 1h)
																		ORDER BY bin(time, 1h) DESC
																		LIMIT 100
																	`}
																>
																	{({ data }) => (
																		<HistoricalDataChart
																			data={data}
																			type={'line'}
																		/>
																	)}
																</HistoricalDataLoader>
															</Collapsable>
															<hr />
															<Collapsable
																id={'cat:environment'}
																title={<h3>{emojify('🌡️ Temperature')}</h3>}
															>
																<HistoricalDataLoader<{
																	date: Date
																	value: number
																}>
																	timestreamQueryContext={
																		timestreamQueryContext
																	}
																	deviceId={catId}
																	QueryString={(table) => `SELECT
																	time as date, measure_value::double AS value
																	FROM ${table}
																	WHERE deviceId='${catId}' 
																	AND measure_name='env.temp' 
																	ORDER BY time DESC
																	LIMIT 100`}
																>
																	{({ data }) => (
																		<HistoricalDataChart
																			data={data}
																			type={'line'}
																		/>
																	)}
																</HistoricalDataLoader>
															</Collapsable>
															<hr />
															<Collapsable
																id={'cat:button'}
																title={<h3>{emojify('🚨 Button')}</h3>}
															>
																<HistoricalDataLoader<{
																	date: Date
																	value: number
																}>
																	timestreamQueryContext={
																		timestreamQueryContext
																	}
																	deviceId={catId}
																	QueryString={(table) => `		
																	SELECT measure_value::double AS value, time as date
																	FROM ${table}
																	WHERE deviceId='${catId}' 
																	AND measure_name='btn'
																	ORDER BY time DESC
																	LIMIT 10
																	`}
																>
																	{({ data }) => (
																		<HistoricalButtonPresses data={data} />
																	)}
																</HistoricalDataLoader>
															</Collapsable>
															<hr />
															<Collapsable
																id={'cat:dangerzone'}
																title={<h3>{emojify('☠️ Danger Zone')}</h3>}
															>
																<DeleteCat
																	catId={catId}
																	onDelete={() => {
																		deleteCat(catId)
																			.then(() => {
																				setDeleted(true)
																			})
																			.catch(console.error)
																	}}
																/>
															</Collapsable>
														</Cat>
													)
												}}
											</CatLoader>
										)
									}}
								</IotConsumer>
							)}
						</CredentialsConsumer>
					)}
				</TimestreamQueryConsumer>
			)}
		</StackConfigConsumer>
	)
}
