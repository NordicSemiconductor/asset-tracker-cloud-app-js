import React from 'react'

export const OutDatedWarning = ({
	desired,
	reported,
	onNotReported,
	onOutDated,
}: {
	desired?: boolean | number
	reported?: {
		value: boolean | number
		receivedAt: Date
	}
	onNotReported: React.ReactElement<any>
	onOutDated: (reported: {
		value: boolean | number
		receivedAt: Date
	}) => React.ReactElement<any>
}) => {
	if (desired === undefined) return null // No config has been set by the user, yet
	const reportedDoesNotMatchDesired = reported && desired === reported.value
	if (reportedDoesNotMatchDesired) {
		return null
	}
	if (reported) {
		return onOutDated(reported)
	}
	return <>{onNotReported}</>
}
