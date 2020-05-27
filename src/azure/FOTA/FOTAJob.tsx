import { AzureFOTAJob, AzureFOTAJobProgress } from '../../@types/azure-device'
import { emojify } from '../../Emojify/Emojify'
import { RelativeTime } from '../../RelativeTime/RelativeTime'
import React from 'react'
import styled from 'styled-components'
import { MakeReceivedProperty } from '../../@types/device-state'

const JobItem = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`

const TimeInfo = styled.span`
	margin-left: 0.5rem;
`

const DownloadLink = styled.a`
	font-size: 80%;
`

export const Jobs = ({
	jobs,
}: {
	jobs: {
		job: MakeReceivedProperty<AzureFOTAJob>
		status?: MakeReceivedProperty<AzureFOTAJobProgress>
	}[]
}) => {
	if (!jobs.length) return null
	return (
		<>
			<hr />
			<h4>Jobs for this device</h4>
			{jobs.map(({ job: { jobId, location }, status }) => (
				<JobItem key={jobId.value}>
					<span>
						{status?.status && (
							<>
								<code>{status.status.value}</code>{' '}
							</>
						)}
						<TimeInfo>
							{emojify('📩 ')}
							<RelativeTime ts={jobId.receivedAt} />
						</TimeInfo>

						{status?.status && (
							<TimeInfo>
								{emojify('⏳ ')}
								<RelativeTime ts={status.status.receivedAt} />
							</TimeInfo>
						)}
						<br />
						<DownloadLink
							href={location.value}
							target="_blank"
							rel="noopener noreferrer"
						>
							Download
						</DownloadLink>
					</span>
				</JobItem>
			))}
		</>
	)
}
