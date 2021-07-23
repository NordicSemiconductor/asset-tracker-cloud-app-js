import React from 'react'
import { Alert } from 'reactstrap'
import styled from 'styled-components'

const StyledAlert = styled(Alert)`
	margin-bottom: 0;
`

export const SignalRDisabledWarning = () => (
	<StyledAlert color={'warning'}>
		<strong>Real-time updates disabled.</strong>
		<br />
		The connection to the{' '}
		<a
			href={'https://azure.microsoft.com/en-us/services/signalr-service/'}
			target={'_blank'}
			rel={'noreferrer nofollow'}
		>
			Azure SignalR Service
		</a>{' '}
		could not be established because of too many connections. Consider scaling
		up the service units.
	</StyledAlert>
)
