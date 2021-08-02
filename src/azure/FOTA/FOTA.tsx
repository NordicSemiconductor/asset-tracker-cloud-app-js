import React, { useState } from 'react'
import { AzureFOTAJobProgress } from '../../@types/azure-device'
import { ErrorInfo } from '../../Error/ErrorInfo'
import { CreateReportedFOTAJobProgress } from './CreateFOTAJob'

export type OnCreateUpgradeJob = (args: { file: File; version: string }) => void

export const FOTA = ({
	fw,
	onCreateUpgradeJob,
	renderError,
}: {
	fw: AzureFOTAJobProgress
	onCreateUpgradeJob: OnCreateUpgradeJob
	renderError: (args: { error: Error | ErrorInfo }) => JSX.Element
}) => {
	const [error, setError] = useState<Error>()
	const [addJobKey, setAddJobKey] = useState(1)

	return (
		<>
			{error && renderError({ error })}
			{(!fw.currentFwVersion &&
				renderError({
					error: {
						message: 'The device has not yet reported an application version.',
						type: 'Warning',
					},
				})) ||
				null}
			{fw.currentFwVersion && (
				<>
					<CreateReportedFOTAJobProgress
						key={`uploadfile-${addJobKey}`}
						fw={fw}
						onError={setError}
						onJob={(job) => {
							onCreateUpgradeJob(job)
							setAddJobKey(addJobKey + 1)
						}}
					/>
				</>
			)}
		</>
	)
}
