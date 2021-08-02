import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AboutPage as AzureAboutPage } from './azure/About/Page'
import { AboutPage as AWSAboutPage } from './aws/About/Page'
import { CatPage } from './azure/Cat/Page'
import { CatsPage } from './azure/Cats/Page'
import { CatsMapPage } from './azure/CatsMap/Page'
import { Login } from './theme/bootstrap4/azure/Login'
import { DisplayError } from './theme/bootstrap4/Error'
import { CloudFlavour } from './flavour'

const cloudFlavour =
	(process.env.REACT_APP_CLOUD_FLAVOUR as CloudFlavour) ?? CloudFlavour.AWS

const version = process.env.REACT_APP_VERSION ?? '0.0.0-development'

const launch = (App: any) => {
	console.log(`Launching ${cloudFlavour} app ${version}...`)
	ReactDOM.render(<App />, document.getElementById('root'))
}
const onError = (err: Error) => {
	console.error(err)
}
switch (cloudFlavour) {
	case CloudFlavour.Azure:
		import('./azure/App')
			.then((azureApp) => {
				launch(
					azureApp.boot({
						apiEndpoint: (
							process.env.REACT_APP_AZURE_API_ENDPOINT ?? ''
						).replace(/\/+$/, ''),
						clientId: process.env.REACT_APP_AZURE_CLIENT_ID ?? '',
						adB2cTenant: process.env.REACT_APP_AZURE_B2C_TENANT ?? '',
						// FIXME: figure out how to pass this as renderLogin: Login,
						renderLogin: (args) => <Login {...args} />,
						aboutPage: () => <AzureAboutPage version={version} />,
						catsPage: CatsPage,
						catPage: CatPage,
						catsMapPage: CatsMapPage,
						renderError: DisplayError,
					}),
				)
			})
			.catch(onError)
		break
	case CloudFlavour.AWS:
	default:
		import('./aws/App')
			.then((awsApp) => {
				const [timestreamDb, timestreamTable] =
					process.env.REACT_APP_HISTORICALDATA_TABLE_INFO?.split('|') ?? [
						'',
						'',
					]
				launch(
					awsApp.boot({
						identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID ?? '',
						region:
							process.env.REACT_APP_REGION ??
							process.env.REACT_APP_MQTT_ENDPOINT?.split('.')[2] ??
							'',
						userPoolId: process.env.REACT_APP_USER_POOL_ID ?? '',
						userPoolClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID ?? '',
						timestreamConfig: {
							db: timestreamDb,
							table: timestreamTable,
						},
						mqttEndpoint: process.env.REACT_APP_MQTT_ENDPOINT ?? '',
						userIotPolicyArn: process.env.REACT_APP_USER_IOT_POLICY_ARN ?? '',
						avatarBucketName: process.env.REACT_APP_AVATAR_BUCKET_NAME ?? '',
						fotaBucketName: process.env.REACT_APP_FOTA_BUCKET_NAME ?? '',
						geolocationApiEndpoint: (
							process.env.REACT_APP_GEOLOCATION_API_URL ?? ''
						).replace(/\/+$/, ''),
						neighboringCellGeolocationApiEndpoint: (
							process.env.REACT_APP_NEIGHBOR_CELL_GEOLOCATION_API_URL ?? ''
						).replace(/\/+$/, ''),
						nCellMeasReportTableName:
							process.env.REACT_APP_NCELLMEAS_STORAGE_TABLE_NAME ?? '',
						aboutPage: () => <AWSAboutPage version={version} />,
					}),
				)
			})
			.catch(onError)
}
