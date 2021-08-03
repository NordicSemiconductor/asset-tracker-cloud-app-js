import React, { useEffect, useState } from 'react'
import { Main } from '../../theme/bootstrap4/Styles'
import { CatRouteProps } from '../../Cat/CatRouteProps'
import { Progress } from '../../theme/bootstrap4/Progress'
import { DisplayError } from '../../theme/bootstrap4/Error'
import { CredentialsConsumer, IotConsumer, StackConfigConsumer } from '../App'
import { describeIotThing } from '../describeIotThing'
import { getThingState } from '../getThingState'
import { isSome } from 'fp-ts/lib/Option'
import { ThingState } from '../../@types/aws-device'
import { IoTClient } from '@aws-sdk/client-iot'
import { LoadedCatWithIdentity } from '../../Cat/CatLoader'
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { ErrorInfo } from '../../Error/ErrorInfo'
import { connectAndListenForStateChange } from '../connectAndListenForStateChange'
import { ICredentials } from '@aws-amplify/core'
import { device } from 'aws-iot-device-sdk'
import { toReportedWithReceivedAt } from '../../aws/toReportedWithReceivedAt'
import { Cat as CatView } from '../../theme/bootstrap4/Cat/Cat'
import { ReportedState } from '../../@types/device-state'

type LoadedCatWithIdentityAndState = {
	state?: ThingState
} & LoadedCatWithIdentity

const CatLoader = ({
	catId,
	iot,
	iotData,
	region,
	renderLoading,
	renderError,
	credentials,
	mqttEndpoint,
	render,
}: {
	catId: string
	iot: IoTClient
	iotData: IoTDataPlaneClient
	region: string
	credentials: ICredentials
	mqttEndpoint: string
	renderLoading: () => JSX.Element
	renderError: (args: { error: Error | ErrorInfo }) => JSX.Element
	render: (args: {
		cat: LoadedCatWithIdentityAndState
		state?: ReportedState
		appV?: string
		dataStaleAfterSeconds: number
	}) => JSX.Element
}) => {
	const [error, setError] = useState<Error | ErrorInfo>()
	const [cat, setCat] = useState<LoadedCatWithIdentityAndState>()

	// Load cat with state
	useEffect(() => {
		let unmounted = false
		void describeIotThing({ iot })(catId).then(
			({ thingName, attributes, version }) => {
				if (unmounted) return
				if (thingName) {
					return getThingState(iotData)(catId).then((maybeState) => {
						if (unmounted) return
						setCat({
							id: catId,
							name: attributes?.name,
							avatar: attributes?.avatar,
							version: version ?? 0,
							state: isSome(maybeState) ? maybeState.value : undefined,
						})
					})
				} else {
					setError({
						type: 'EntityNotFound',
						message: `Failed to describe IoT Thing for cat ${catId}`,
					})
				}
			},
		)
		return () => {
			unmounted = true
		}
	}, [catId, iot, iotData])

	// Subscribe for updates
	useEffect(() => {
		let unmounted = false
		let connection: device
		if (cat === undefined) return

		console.log('Subscribe to updates', cat.id)
		void connectAndListenForStateChange({
			clientId: `user-${credentials.identityId}-${Date.now()}`,
			credentials,
			deviceId: cat.id,
			onNewState: (newState) =>
				setCat((cat) => ({
					...(cat as LoadedCatWithIdentityAndState),
					state: {
						...(cat as LoadedCatWithIdentityAndState).state,
						...newState,
					},
				})),
			region,
			mqttEndpoint,
		})
			.then((c) => {
				if (unmounted) {
					c.end()
					return
				}
				console.log('Subscribed to updates', cat.id)
				connection = c
			})
			.catch(console.error)

		return () => {
			if (connection !== undefined) {
				console.log('Unsubscribe from updates', cat.id)
				connection.end()
			}
			unmounted = true
		}
	}, [cat, credentials, mqttEndpoint, region])

	if (error) return renderError({ error })

	if (cat === undefined) return renderLoading()

	const { state } = cat

	const reportedWithReceived =
		state?.reported &&
		toReportedWithReceivedAt({
			reported: state.reported,
			metadata: state.metadata,
		})

	// Calculate the interval in which the device is expected to publish data
	const expectedSendIntervalInSeconds =
		(state?.reported.cfg?.act ?? true // default device mode is active
			? state?.reported.cfg?.actwt ?? 120 // default active wait time is 120 seconds
			: state?.reported.cfg?.mvt ?? 3600) + // default movement timeout is 3600
		(state?.reported.cfg?.gpst ?? 60) + // default GPS timeout is 60 seconds
		60 // add 1 minute for sending and processing

	return render({
		cat,
		state: reportedWithReceived,
		appV: reportedWithReceived?.dev?.v?.value?.appV,
		dataStaleAfterSeconds: expectedSendIntervalInSeconds,
	})
}

export const CatPage = (props: CatRouteProps) => {
	const { catId } = props.match.params

	return (
		<Main>
			<CredentialsConsumer>
				{(credentials) => (
					<StackConfigConsumer>
						{({
							region,
							avatarBucketName,
							fotaBucketName,
							geolocationApiEndpoint,
							neighboringCellGeolocationApiEndpoint,
							nCellMeasReportTableName,
						}) => (
							<IotConsumer>
								{({ iot, iotData, mqttEndpoint }) => (
									<CatLoader
										catId={catId}
										credentials={credentials}
										mqttEndpoint={mqttEndpoint}
										region={region}
										iot={iot}
										iotData={iotData}
										renderLoading={() => (
											<Progress title={`Opening can for cat ${catId}`} />
										)}
										renderError={DisplayError}
										render={CatView}
									/>
								)}
							</IotConsumer>
						)}
					</StackConfigConsumer>
				)}
			</CredentialsConsumer>
		</Main>
	)
}
