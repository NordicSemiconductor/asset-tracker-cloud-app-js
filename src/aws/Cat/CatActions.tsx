import React, { useState } from 'react'
import {
	CredentialsConsumer,
	IotConsumer,
	AthenaConsumer,
	StackConfigConsumer,
} from '../App'
import { Alert } from 'reactstrap'
import { S3 } from 'aws-sdk'
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
			}) => (
				<AthenaConsumer>
					{(athenaContext) => (
						<CredentialsConsumer>
							{(credentials) => (
								<IotConsumer>
									{({ iot, iotData, mqttEndpoint }) => {
										const s3 = new S3({
											credentials,
											region,
										})
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
																	athenaContext={athenaContext}
																	cat={cat}
																	state={state}
																	geolocationApiEndpoint={
																		geolocationApiEndpoint
																	}
																/>
															)}
														>
															<Collapsable
																id={'cat:bat'}
																title={<h3>{emojify('🔋 Battery')}</h3>}
															>
																<HistoricalDataLoader
																	athenaContext={athenaContext}
																	deviceId={catId}
																	QueryString={`SELECT min(reported.bat.v) as value, CAST(date_format(timestamp, '%Y-%m-%d %H:00:00') AS TIMESTAMP) AS date FROM 
			${athenaContext.dataBase}.${athenaContext.rawDataTable} WHERE deviceId='${catId}' AND reported.bat IS NOT NULL GROUP BY CAST(date_format(timestamp, '%Y-%m-%d %H:00:00') AS TIMESTAMP) ORDER BY date DESC LIMIT 100`}
																	formatFields={{
																		value: (v) => parseInt(v, 10) / 1000,
																		date: (v) => {
																			const [d, t] = v.split(' ')
																			return new Date(`${d}T${t}Z`)
																		},
																	}}
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
																<HistoricalDataLoader
																	athenaContext={athenaContext}
																	deviceId={catId}
																	QueryString={`SELECT reported.env.v.temp AS value,
																	date_format(timestamp, '%Y-%m-%dT%H:%i:%sZ') AS date FROM 
			${athenaContext.dataBase}.${athenaContext.rawDataTable} WHERE deviceId='${catId}' AND reported.env IS NOT NULL ORDER BY date DESC LIMIT 100`}
																	formatFields={{
																		value: parseFloat,
																		date: (v) => new Date(v),
																	}}
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
																id={'cat:act'}
																title={<h3>{emojify('🏋️ Activity')}</h3>}
															>
																<HistoricalDataLoader
																	athenaContext={athenaContext}
																	deviceId={catId}
																	formatFields={{
																		value: ({
																			x,
																			y,
																			z,
																		}: {
																			x: number
																			y: number
																			z: number
																		}) =>
																			Math.abs(x) + Math.abs(y) + Math.abs(z),
																		date: (v) => new Date(v),
																	}}
																	QueryString={`SELECT reported.acc.ts as date, reported.acc.v as value FROM ${athenaContext.dataBase}.${athenaContext.rawDataTable} WHERE deviceId='${catId}' AND reported.acc IS NOT NULL ORDER BY reported.acc.ts DESC LIMIT 100`}
																>
																	{({ data }) => (
																		<HistoricalDataChart
																			data={data}
																			type={'column'}
																		/>
																	)}
																</HistoricalDataLoader>
															</Collapsable>
															<hr />
															<Collapsable
																id={'cat:button'}
																title={<h3>{emojify('🚨 Button')}</h3>}
															>
																<HistoricalDataLoader
																	athenaContext={athenaContext}
																	deviceId={catId}
																	formatFields={{
																		date: (v) => new Date(v),
																	}}
																	QueryString={`		
																	SELECT message.btn.v AS value,
																		message.btn.ts AS date,
																		timestamp
																	FROM ${athenaContext.dataBase}.${athenaContext.rawDataTable}
																	WHERE deviceid = '${catId}'
																	AND message.btn IS NOT NULL
																	ORDER BY timestamp DESC
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
				</AthenaConsumer>
			)}
		</StackConfigConsumer>
	)
}
