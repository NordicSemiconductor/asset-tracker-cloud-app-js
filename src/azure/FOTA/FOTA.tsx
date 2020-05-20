import React, { useState } from 'react'
import { Alert } from 'reactstrap'
import { DisplayError as ShowError } from '../../Error/Error'
import { CreateDeviceUpgradeFirmwareJob } from './CreateFOTAJob'
import { DeviceInformation } from '../../@types/device-state'

export type OnCreateUpgradeJob = (args: {
	file: File
	data: ArrayBuffer
}) => void

export const FOTA = ({
	device,
	onCreateUpgradeJob,
}: {
	device: DeviceInformation
	onCreateUpgradeJob: OnCreateUpgradeJob
}) => {
	const [error, setError] = useState<Error>()
	const [addJobKey, setAddJobKey] = useState(1)

	return (
		<>
			{(!device.v.appV && (
				<Alert color={'danger'}>
					The device has not yet reported an application version.
				</Alert>
			)) ||
				null}
			{device.v.appV && (
				<>
					{error && <ShowError error={error} />}
					<CreateDeviceUpgradeFirmwareJob
						key={`uploadfile-${addJobKey}`}
						device={device}
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
