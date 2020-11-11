import * as React from 'react'
import * as ReactDOM from 'react-dom'

export enum CloudFlavour {
	Azure = 'Azure',
	AWS = 'AWS',
}

const cloudFlavour =
	(process.env.REACT_APP_CLOUD_FLAVOUR as CloudFlavour) ?? CloudFlavour.AWS

export type ReactAppConfigType = {
	cloudFlavour: CloudFlavour
	version: string
}

const ReactAppConfig = React.createContext<ReactAppConfigType>({
	cloudFlavour: CloudFlavour.AWS,
	version: '',
})
export const ReactAppConfigConsumer = ReactAppConfig.Consumer

const version = process.env.REACT_APP_VERSION ?? '0.0.0-development'

const launch = (App: any) => {
	console.log(`Launching ${cloudFlavour} app ${version}...`)
	ReactDOM.render(
		<ReactAppConfig.Provider
			value={{
				cloudFlavour,
				version,
			}}
		>
			<App />
		</ReactAppConfig.Provider>,
		document.getElementById('root'),
	)
}
const onError = (err: Error) => {
	console.error(err)
}
switch (cloudFlavour) {
	case CloudFlavour.Azure:
		console.log(`Launching Microsoft Azure app ...`)
		import('./azure/App')
			.then((azureApp) => {
				launch(
					azureApp.boot({
						apiEndpoint: (
							process.env.REACT_APP_AZURE_API_ENDPOINT ?? ''
						).replace(/\/+$/, ''),
						clientId: process.env.REACT_APP_AZURE_CLIENT_ID ?? '',
						adB2cTenant: process.env.REACT_APP_AZURE_B2C_TENANT ?? '',
					}),
				)
			})
			.catch(onError)
		break
	case CloudFlavour.AWS:
	default:
		console.log(`Launching Amazon Webservices app ...`)
		import('./aws/App')
			.then((awsApp) => {
				launch(
					awsApp.boot({
						identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID ?? '',
						region: process.env.REACT_APP_REGION ?? '',
						userPoolId: process.env.REACT_APP_USER_POOL_ID ?? '',
						userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID ?? '',
						athenaConfig: {
							workGroup:
								process.env.REACT_APP_HISTORICALDATA_WORKGROUP_NAME ?? '',
							dataBase:
								process.env.REACT_APP_HISTORICALDATA_DATABASE_NAME ?? '',
							rawDataTable:
								process.env.REACT_APP_HISTORICALDATA_TABLE_NAME ?? '',
							bucketName:
								process.env.REACT_APP_HISTORICAL_DATA_BUCKET_NAME ?? '',
						},
						mqttEndpoint: process.env.REACT_APP_MQTT_ENDPOINT ?? '',
						userIotPolicyArn: process.env.REACT_APP_USER_IOT_POLICY_ARN ?? '',
						avatarBucketName: process.env.REACT_APP_AVATAR_BUCKET_NAME ?? '',
						fotaBucketName: process.env.REACT_APP_FOTA_BUCKET_NAME ?? '',
						geolocationApiEndpoint: (
							process.env.REACT_APP_GEOLOCATION_API_URL ?? ''
						).replace(/\/+$/, ''),
					}),
				)
			})
			.catch(onError)
}
