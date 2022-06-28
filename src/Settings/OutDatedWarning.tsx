import { isEqual } from 'lodash'
import React from 'react'
import { ReceivedProperty } from '../@types/device-state'

export const OutDatedWarning = ({
	desired,
	reported,
	onNotReported,
	onOutDated,
}: {
	desired?: unknown
	reported?: ReceivedProperty<unknown>
	onNotReported: React.ReactElement<any>
	onOutDated: (reported: {
		value: unknown
		receivedAt: Date
	}) => React.ReactElement<any>
}) => {
	if (desired === undefined) return null // No config has been set by the user, yet
	const reportedDoesMatchDesired = reported && isEqual(desired, reported.value)
	if (reportedDoesMatchDesired === true) {
		return null
	}
	if (reported) {
		return onOutDated(reported)
	}
	return <>{onNotReported}</>
}
