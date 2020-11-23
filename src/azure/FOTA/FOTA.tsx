import React, { useState } from 'react'
import { Alert } from 'reactstrap'
import { AzureFOTAJobProgress } from '../../@types/azure-device'
import { DisplayError as ShowError } from '../../Error/Error'
import { CreateReportedFOTAJobProgress } from './CreateFOTAJob'

export type OnCreateUpgradeJob = (args: { file: File; version: string }) => void

export const FOTA = ({
	fw,
	onCreateUpgradeJob,
}: {
	fw: AzureFOTAJobProgress
	onCreateUpgradeJob: OnCreateUpgradeJob
}) => {
	const [error, setError] = useState<Error>()
	const [addJobKey, setAddJobKey] = useState(1)

	return (
		<>
			{(!fw.currentFwVersion && (
				<Alert color={'danger'}>
					The device has not yet reported an application version.
				</Alert>
			)) ||
				null}
			{fw.currentFwVersion && (
				<>
					{error && <ShowError error={error} />}
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
