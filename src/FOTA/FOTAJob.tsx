import { DeviceUpgradeFirmwareJob } from '../aws/listUpgradeFirmwareJobs'
import { emojify } from '../Emojify/Emojify'
import { RelativeTime } from '../RelativeTime/RelativeTime'
import { Button } from 'reactstrap'
import React from 'react'
import styled from 'styled-components'

const JobItem = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`

const TimeInfo = styled.span`
	margin-left: 0.5rem;
`

const UpgradeDocument = styled.dl`
	display: flex;
	font-size: 80%;
	dt,
	dl {
		margin-right: 0.25rem;
		margin-left: 0.25rem;
	}
	dt:first-child {
		margin-left: 0;
	}
`

const DownloadLink = styled.a`
	font-size: 80%;
`

export const Jobs = ({
	jobs,
	cancelUpgradeJob,
	deleteUpgradeJob,
}: {
	jobs: DeviceUpgradeFirmwareJob[]
	cancelUpgradeJob: (args: { jobId: string; force: boolean }) => void
	deleteUpgradeJob: (args: { jobId: string; executionNumber: number }) => void
}) => {
	return (
		<>
			<h4>Jobs for this device</h4>
			{jobs.map(
				({
					jobId,
					status,
					description,
					queuedAt,
					startedAt,
					lastUpdatedAt,
					executionNumber,
					document: { size, fwversion, targetBoard, location, filename },
				}) => {
					const isInProgress = status === 'IN_PROGRESS'
					const canCancel = ['QUEUED', 'IN_PROGRESS'].includes(status)
					const canDelete = ['FAILED', 'CANCELED', 'SUCCEEDED'].includes(status)
					return (
						<JobItem key={jobId}>
							<span>
								<code>{status}</code>{' '}
								{!canDelete && queuedAt && (
									<TimeInfo>
										{emojify('📩 ')}
										<RelativeTime ts={queuedAt} />
									</TimeInfo>
								)}
								{startedAt && (
									<TimeInfo>
										{emojify('⏳ ')}
										<RelativeTime ts={startedAt} />
									</TimeInfo>
								)}
								{lastUpdatedAt && (
									<TimeInfo>
										{emojify('🕒 ')}
										<RelativeTime ts={lastUpdatedAt} />
									</TimeInfo>
								)}
								<br />
								<em>{description}</em>
								<br />
								<DownloadLink href={location} target={'_blank'}>
									{filename}
								</DownloadLink>
								<UpgradeDocument>
									<dt>Version:</dt>
									<dd>{fwversion}</dd>
									<dt>Size:</dt>
									<dd>{size} byte</dd>
									<dt>Target Board:</dt>
									<dd>{targetBoard}</dd>
								</UpgradeDocument>
							</span>
							{canCancel && (
								<Button
									color={'danger'}
									onClick={() =>
										cancelUpgradeJob({
											jobId,
											force: isInProgress
												? window.confirm(
														'Canceling a job which is "IN_PROGRESS", will cause a device which is executing the job to be unable to update the job execution status. Use caution and ensure that each device executing a job which is canceled is able to recover to a valid state.',
												  )
												: false,
										})
									}
								>
									Cancel
								</Button>
							)}
							{canDelete && (
								<Button
									color={'danger'}
									outline
									onClick={() =>
										deleteUpgradeJob({
											jobId,
											executionNumber,
										})
									}
								>
									Delete
								</Button>
							)}
						</JobItem>
					)
				},
			)}
		</>
	)
}
