import { Button } from 'reactstrap'
import React from 'react'
import styled from 'styled-components'
import { DeviceUpgradeFirmwareJob } from '../../../../aws/listUpgradeFirmwareJobs'
import { emojify } from '../../../../Emojify/Emojify'
import { RelativeTime } from '../../../../RelativeTime/RelativeTime'

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

export const FOTAJobs = ({
	jobs,
	onCancel,
	onClone,
	onDelete,
}: {
	jobs: {
		job: DeviceUpgradeFirmwareJob
		isInProgress: boolean
		canCancel: boolean
		canDelete: boolean
		canClone: boolean
	}[]
	onCancel: (job: DeviceUpgradeFirmwareJob) => void
	onClone: (job: DeviceUpgradeFirmwareJob) => void
	onDelete: (job: DeviceUpgradeFirmwareJob) => void
}) => {
	return (
		<>
			<hr />
			<h4>Jobs for this device</h4>
			{jobs.map(({ job, canCancel, canDelete, canClone }) => {
				const {
					jobId,
					status,
					description,
					queuedAt,
					startedAt,
					lastUpdatedAt,
					document: { size, fwversion, targetBoard, location, filename },
				} = job
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
							<DownloadLink
								href={location}
								target="_blank"
								rel="noopener noreferrer"
							>
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
							<Button color={'danger'} onClick={() => onCancel(job)}>
								Cancel
							</Button>
						)}
						{canClone && (
							<Button
								color={'info'}
								outline
								onClick={() => onClone(job)}
								data-intro={
									'Creates a new Device Firmware Upgrade with the same settings.'
								}
								title={
									'Creates a new Device Firmware Upgrade with the same settings.'
								}
							>
								Clone
							</Button>
						)}
						{canDelete && (
							<Button color={'danger'} outline onClick={() => onDelete(job)}>
								Delete
							</Button>
						)}
					</JobItem>
				)
			})}
		</>
	)
}
