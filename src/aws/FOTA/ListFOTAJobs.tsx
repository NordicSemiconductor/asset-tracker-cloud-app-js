import { useEffect, useState } from 'react'
import { DeviceUpgradeFirmwareJob } from '../listUpgradeFirmwareJobs'
import { useDebouncedCallback } from 'use-debounce'

export const ListFOTAJobs = ({
	listUpgradeJobs,
	cancelUpgradeJob,
	deleteUpgradeJob,
	cloneUpgradeJob,
	render,
}: {
	listUpgradeJobs: () => Promise<DeviceUpgradeFirmwareJob[]>
	cancelUpgradeJob: (args: { jobId: string; force: boolean }) => Promise<void>
	deleteUpgradeJob: (args: {
		jobId: string
		executionNumber: number
	}) => Promise<void>
	cloneUpgradeJob: (args: {
		jobId: string
	}) => Promise<DeviceUpgradeFirmwareJob>
	render: (args: {
		jobs: {
			job: DeviceUpgradeFirmwareJob
			canCancel: boolean
			canDelete: boolean
			canClone: boolean
			isInProgress: boolean
		}[]
		onCancel: (job: DeviceUpgradeFirmwareJob) => void
		onClone: (job: DeviceUpgradeFirmwareJob) => void
		onDelete: (job: DeviceUpgradeFirmwareJob) => void
	}) => JSX.Element
}) => {
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

	if (jobs.length === 0) return null

	return render({
		jobs: jobs.map((job) => {
			const canCancel = ['QUEUED', 'IN_PROGRESS'].includes(job.status)
			const canDelete = ['FAILED', 'CANCELED', 'SUCCEEDED'].includes(job.status)
			const isInProgress = job.status === 'IN_PROGRESS'
			return {
				job,
				canCancel,
				canDelete,
				canClone: canDelete,
				isInProgress,
			}
		}),
		onCancel: (job) => {
			const isInProgress = job.status === 'IN_PROGRESS'
			void cancelUpgradeJob({
				...job,
				force: isInProgress
					? window.confirm(
							'Canceling a job which is "IN_PROGRESS", will cause a device which is executing the job to be unable to update the job execution status. Use caution and ensure that each device executing a job which is canceled is able to recover to a valid state.',
					  )
					: false,
			})
				.then(() => {
					debouncedListUpgradeJobs()
				})
				.catch((err) => {
					console.error(err)
				})
		},
		onDelete: (job) => {
			void deleteUpgradeJob(job)
				.then(() => {
					debouncedListUpgradeJobs()
				})
				.catch((err) => {
					console.error(err)
				})
		},
		onClone: (job) => {
			void cloneUpgradeJob(job)
				.then((createdJob) => {
					setJobs([createdJob, ...jobs])
					setAddJobKey(addJobKey + 1)
				})
				.catch((err) => {
					console.error(err)
				})
		},
	})
}
