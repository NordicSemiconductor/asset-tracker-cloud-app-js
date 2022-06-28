import styled from 'styled-components'
import { AzureFOTAJob, AzureFOTAJobProgress } from '../../@types/azure-device'
import { MakeReceivedProperty } from '../../@types/device-state'
import { emojify } from '../../Emojify/Emojify'
import { RelativeTime } from '../../RelativeTime/RelativeTime'

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

			{jobs.map(({ job: { fwVersion, fwPackageURI }, status }) => (
				<JobItem key={fwVersion.value}>
					<strong>{fwVersion.value}</strong>
					{status?.fwUpdateStatus && (
						<>
							<code>{status.fwUpdateStatus.value}</code>{' '}
						</>
					)}
					<TimeInfo>
						{emojify('📩 ')}
						<RelativeTime ts={fwVersion.receivedAt} />
					</TimeInfo>

					{status?.fwUpdateStatus && (
						<TimeInfo>
							{emojify('⏳ ')}
							<RelativeTime ts={status.fwUpdateStatus.receivedAt} />
						</TimeInfo>
					)}
					<br />
					{fwPackageURI !== undefined && (
						<DownloadLink
							href={fwPackageURI.value}
							target="_blank"
							rel="noopener noreferrer"
						>
							Download
						</DownloadLink>
					)}
				</JobItem>
			))}
		</>
	)
}
