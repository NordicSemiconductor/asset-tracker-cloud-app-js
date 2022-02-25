import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { boot } from './azure/App'

export type ReactAppConfigType = {
	version: string
}

const ReactAppConfig = React.createContext<ReactAppConfigType>({
	version: '',
})
export const ReactAppConfigConsumer = ReactAppConfig.Consumer

const version = process.env.REACT_APP_VERSION ?? '0.0.0-development'

const launch = (App: any) => {
	console.log(`Launching app ${version}...`)
	ReactDOM.render(
		<ReactAppConfig.Provider
			value={{
				version,
			}}
		>
			<App />
		</ReactAppConfig.Provider>,
		document.getElementById('root'),
	)
}

launch(
	boot({
		apiEndpoint: (process.env.REACT_APP_AZURE_API_ENDPOINT ?? '').replace(
			/\/+$/,
			'',
		),
		clientId: process.env.REACT_APP_AZURE_CLIENT_ID ?? '',
		adB2cTenant: process.env.REACT_APP_AZURE_B2C_TENANT ?? '',
	}),
)
