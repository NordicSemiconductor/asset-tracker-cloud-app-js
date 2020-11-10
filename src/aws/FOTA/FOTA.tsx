import React, { useEffect, useState } from 'react'
import { Alert } from 'reactstrap'
import { DisplayError as ShowError } from '../../Error/Error'
import { DeviceUpgradeFirmwareJob } from '../listUpgradeFirmwareJobs'
import { useDebouncedCallback } from 'use-debounce'
import { Jobs } from './FOTAJob'
import { CreateFOTAJob } from './CreateFOTAJob'
import { DeviceInformation } from '../../@types/device-state'

export type OnCreateUpgradeJob = (args: {
	file: File
	data: ArrayBuffer
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
}: {
	device: DeviceInformation
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
}) => {
	const [error, setError] = useState<Error>()
	const [jobs, setJobs] = useState([] as DeviceUpgradeFirmwareJob[])
	const [addJobKey, setAddJobKey] = useState(1)

	const { callback: debouncedListUpgradeJobs } = useDebouncedCallback(() => {
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
			{(!device.v.appV && (
				<Alert color={'danger'}>
					The device has not yet reported an application version.
				</Alert>
			)) ||
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
