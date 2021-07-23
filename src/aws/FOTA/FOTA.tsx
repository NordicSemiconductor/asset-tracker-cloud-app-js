import React, { useEffect, useState } from 'react'
import { DisplayError as ShowError } from '../../theme/bootstrap4/Error'
import { DeviceUpgradeFirmwareJob } from '../listUpgradeFirmwareJobs'
import { useDebouncedCallback } from 'use-debounce'
import { Jobs } from './FOTAJob'
import { CreateFOTAJob } from './CreateFOTAJob'
import { AWSDeviceInformation } from '../../@types/aws-device'
import { ErrorInfo } from '../../Error/ErrorInfo'

export type OnCreateUpgradeJob = (args: {
	file: File
	targetBoard: string
	version: string
}) => Promise<DeviceUpgradeFirmwareJob>

export const FOTA = ({
	device,
	onCreateUpgradeJob,
	listUpgradeJobs,
	cancelUpgradeJob,
	deleteUpgradeJob,
	cloneUpgradeJob,
	renderError,
}: {
	device: AWSDeviceInformation
	onCreateUpgradeJob: OnCreateUpgradeJob
	listUpgradeJobs: () => Promise<DeviceUpgradeFirmwareJob[]>
	cancelUpgradeJob: (args: { jobId: string; force: boolean }) => Promise<void>
	deleteUpgradeJob: (args: {
		jobId: string
		executionNumber: number
	}) => Promise<void>
	cloneUpgradeJob: (args: {
		jobId: string
	}) => Promise<DeviceUpgradeFirmwareJob>
	renderError: (args: { error: Error | ErrorInfo }) => JSX.Element
}) => {
	const [error, setError] = useState<Error>()
	const [jobs, setJobs] = useState([] as DeviceUpgradeFirmwareJob[])
	const [addJobKey, setAddJobKey] = useState(1)

	const debouncedListUpgradeJobs = useDebouncedCallback(() => {
		listUpgradeJobs()
			.then(setJobs)
			.catch((err) => {
				console.error(err)
			})
	}, 250)

	useEffect(() => {
		debouncedListUpgradeJobs()
	}, [debouncedListUpgradeJobs])

	return (
		<>
			{(!device.v.appV &&
				renderError({
					error: {
						message: 'The device has not yet reported an application version.',
						type: 'Warning',
					},
				})) ||
				null}
			{device.v.appV && (
				<>
					{error && <ShowError error={error} />}
					<CreateFOTAJob
						key={`uploadfile-${addJobKey}`}
						device={device}
						onError={setError}
						onJob={async (job) =>
							onCreateUpgradeJob(job).then((createdJob) => {
								setJobs([createdJob, ...jobs])
								setAddJobKey(addJobKey + 1)
								return createdJob
							})
						}
					/>
				</>
			)}
			{jobs.length > 0 ? (
				<>
					<hr />
					<Jobs
						jobs={jobs}
						cancelUpgradeJob={(args) => {
							cancelUpgradeJob(args)
								.then(() => {
									debouncedListUpgradeJobs()
								})
								.catch((err) => {
									console.error(err)
								})
						}}
						deleteUpgradeJob={(args) => {
							deleteUpgradeJob(args)
								.then(() => {
									debouncedListUpgradeJobs()
								})
								.catch((err) => {
									console.error(err)
								})
						}}
						cloneUpgradeJob={(args) => {
							cloneUpgradeJob(args)
								.then((createdJob) => {
									setJobs([createdJob, ...jobs])
									setAddJobKey(addJobKey + 1)
								})
								.catch((err) => {
									console.error(err)
								})
						}}
					/>
				</>
			) : null}
		</>
	)
}
