import React, { useState } from 'react'
import {
	CredentialsConsumer,
	IotConsumer,
	TimestreamQueryConsumer,
	StackConfigConsumer,
} from '../App'
import { S3Client } from '@aws-sdk/client-s3'
import { uploadAvatar } from '../uploadAvatar'
import { updateThingAttributes } from '../updateThingAttributes'
import { HistoricalDataChart } from '../../HistoricalData/HistoricalDataChart'
import { HistoricalDataLoader } from '../HistoricalData/HistoricalDataLoader'
import { describeIotThing } from '../describeIotThing'
import { upgradeFirmware } from '../upgradeFirmware'
import { listUpgradeFirmwareJobs } from '../listUpgradeFirmwareJobs'
import { cancelUpgradeFirmwareJob } from '../cancelUpgradeFirmwareJob'
import { deleteUpgradeFirmwareJob } from '../deleteUpgradeFirmwareJob'
import { cloneUpgradeFirmwareJob } from '../cloneUpgradeFirmwareJob'
import { deleteIotThing } from '../deleteIotThing'
import { connectAndListenForStateChange } from '../connectAndListenForStateChange'
import { getThingState } from '../getThingState'
import { updateThingConfig } from '../updateThingConfig'
import { Cat } from './Cat'
import { CatMap } from './CatMap'
import { CatLoader } from '../../Cat/CatLoader'
import { left, right } from 'fp-ts/lib/Either'
import { HttpRequest } from '@aws-sdk/protocol-http'
import { dbmToRSRP } from '@nordicsemiconductor/rsrp-bar'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { getNeighboringCellMeasurementReport } from '../getNeighboringCellMeasurementReport'
import { NeighborCellMeasurementsReport } from '../../DeviceInformation/NeighborCellMeasurementsReport'
import { CollapsedContextProvider } from '../../util/CollapsedContext'
import { ErrorInfo } from '../../Error/ErrorInfo'

export const CatActions = ({
	catId,
	renderOnDeleted,
	renderError,
	renderConnectionInformation,
	renderHistoricalButtonPresses,
	renderCollapsable,
	renderDelete,
	renderDivider,
	render,
	renderLoading,
}: {
	catId: string
	renderOnDeleted: () => JSX.Element
	renderError: (args: { error: Error | ErrorInfo }) => JSX.Element
	renderConnectionInformation: (args: {
		networkMode?: string
		iccid?: string
		rsrp: number
		mccmnc: number
		receivedAt: Date
		reportedAt: Date
		dataStaleAfterSeconds: number
	}) => JSX.Element
	renderHistoricalButtonPresses: (args: {
		presses: { button: number; date: Date }[]
	}) => JSX.Element
	renderCollapsable: (args: {
		title: string
		id: string
		children: JSX.Element | JSX.Element[]
	}) => JSX.Element
	renderDelete: (args: {
		catId: string
		onDelete: () => unknown
	}) => JSX.Element
	renderDivider: () => JSX.Element
	render: (args: {
		header: JSX.Element
		body: JSX.Element
		map?: JSX.Element
	}) => JSX.Element
	renderLoading: () => JSX.Element
}) => {
	const [deleted, setDeleted] = useState(false)

	if (deleted) {
		return renderOnDeleted()
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
												renderError={renderError}
												renderLoading={renderLoading}
												render={({ cat, update }) => (
													<>
														<CollapsedContextProvider>
															<Cat
																cat={cat}
																credentials={credentials}
																getThingState={async () =>
																	getThingState(iotData)(catId)
																}
																renderConnectionInformation={
																	renderConnectionInformation
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
																	}).then(
																		(connection) => () => connection.end(),
																	)
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
																	attributeUpdater({ name }).catch(
																		console.error,
																	)
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
																renderError={renderError}
																render={render}
																renderCollapsable={renderCollapsable}
																renderDivider={renderDivider}
															>
																{renderDivider()}
																{renderCollapsable({
																	id: 'cat:ncell',
																	title: '🗧 Neighboring cells',
																	children: (
																		<NeighborCellMeasurementsReport
																			key={cat.version}
																			getNeighboringCellMeasurementReport={async () =>
																				getNcellmeas({ deviceId: cat.id })
																			}
																		/>
																	),
																})}
																{renderDivider()}
																{renderCollapsable({
																	id: 'cat:roam',
																	title: '📶 RSRP',
																	children: (
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
																	),
																})}
																{renderDivider()}
																{renderCollapsable({
																	id: 'cat:bat',
																	title: '🔋 Battery',
																	children: (
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
																	),
																})}
																{renderDivider()}
																{renderCollapsable({
																	id: 'cat:environment',
																	title: '🌡️ Temperature',
																	children: (
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
																	),
																})}
																{renderDivider()}
																{renderCollapsable({
																	id: 'cat:button',
																	title: '🚨 Button',
																	children: (
																		<HistoricalDataLoader<{
																			date: Date
																			button: number
																		}>
																			timestreamQueryContext={
																				timestreamQueryContext
																			}
																			deviceId={catId}
																			QueryString={(table) => `		
																SELECT measure_value::double AS button, time as date
																FROM ${table}
																WHERE deviceId='${catId}' 
																AND measure_name='btn'
																ORDER BY time DESC
																LIMIT 10
																`}
																		>
																			{({ data }) =>
																				renderHistoricalButtonPresses({
																					presses: data,
																				})
																			}
																		</HistoricalDataLoader>
																	),
																})}
																{renderDivider()}
																{renderCollapsable({
																	id: 'cat:dangerzone',
																	title: '☠️ Danger Zone',
																	children: renderDelete({
																		catId,
																		onDelete: () => {
																			deleteCat(catId)
																				.then(() => {
																					setDeleted(true)
																				})
																				.catch(console.error)
																		},
																	}),
																})}
															</Cat>
														</CollapsedContextProvider>
														)
													</>
												)}
											/>
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
