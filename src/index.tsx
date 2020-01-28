import * as React from 'react'
import * as ReactDOM from 'react-dom'

const cloudFlavour = process.env.REACT_APP_CLOUD_FLAVOUR

const launch = (App: any) => {
	ReactDOM.render(<App />, document.getElementById('root'))
}
const onError = (err: Error) => {
	console.error(err)
}
switch (cloudFlavour) {
	case 'GCP':
		console.log(`Launching Google Cloud Platform app ...`)
		import('./gcp/App')
			.then(gcpApp => {
				launch(
					gcpApp.boot({
						apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
						authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
					}),
				)
			})
			.catch(onError)
		break
	case 'AZURE':
		console.log(`Launching Microsoft Azure app ...`)
		import('./azure/App')
			.then(azureApp => {
				launch(
					azureApp.boot({
						clientId: process.env.REACT_APP_AZURE_CLIENT_ID || '',
						redirectUri: process.env.REACT_APP_AZURE_REDIRECT_URI || '',
						authority: process.env.REACT_APP_AZURE_AD_B2C_AUTHORITY || '',
					}),
				)
			})
			.catch(onError)
		break
	default:
		console.log(`Launching Amazon Webservices app ...`)
		import('./aws/App')
			.then(awsApp => {
				launch(
					awsApp.boot({
						identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID || '',
						region: process.env.REACT_APP_REGION || '',
						userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
						userPoolWebClientId:
							process.env.REACT_APP_USER_POOL_CLIENT_ID || '',
					}),
				)
			})
			.catch(onError)
}
