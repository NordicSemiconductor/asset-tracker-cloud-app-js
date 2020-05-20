import { DeviceUpgradeFirmwareJob } from '../api'
import { emojify } from '../../Emojify/Emojify'
import { RelativeTime } from '../../RelativeTime/RelativeTime'
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

const DownloadLink = styled.a`
	font-size: 80%;
`

export const Jobs = ({ jobs }: { jobs: DeviceUpgradeFirmwareJob[] }) => {
	if (!jobs.length) return null
	return (
		<>
			<hr />
			<h4>Jobs for this device</h4>
			{jobs.map(
				({ jobId, status, queuedAt, startedAt, lastUpdatedAt, location }) => (
					<JobItem key={jobId}>
						<span>
							<code>{status}</code>{' '}
							{queuedAt && (
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
							<DownloadLink
								href={location}
								target="_blank"
								rel="noopener noreferrer"
							>
								Download
							</DownloadLink>
						</span>
					</JobItem>
				),
			)}
		</>
	)
}
