import React from 'react'
import { SolutionConfigContextType } from '../../../../azure/App'
import { DLCard } from '../../DLCard'

export const Configuration = ({
	config,
}: {
	config: SolutionConfigContextType
}) => (
	<DLCard
		title="Environment"
		intro="This card shows the apps' configuration."
		entries={{
			'App client id': <code>{config.clientId}</code>,
			'API Endpoint': <code>{config.apiEndpoint}</code>,
		}}
	/>
)
