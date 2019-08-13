import React from 'react'
import { RelativeTime } from '../RelativeTime/RelativeTime'
import {
	AccessTimeRounded as TimeIcon,
	CloudDone as CloudIcon,
} from '@material-ui/icons'
import { distanceInWords } from 'date-fns'

export const ReportedTime = ({
	reportedAt,
	receivedAt,
}: {
	reportedAt: Date
	receivedAt: Date
}) => {
	const reportedTimeIsOutDated =
		(receivedAt.getTime() - reportedAt.getTime()) / 1000 > 300
	const relativeTimesHaveDiff =
		distanceInWords(new Date(), receivedAt, { includeSeconds: true }) !==
		distanceInWords(new Date(), reportedAt, {
			includeSeconds: true,
		})
	try {
		return (
			<span className={'reportedTime'}>
				<TimeIcon />{' '}
				<RelativeTime ts={reportedAt} key={reportedAt.toISOString()} />
				{reportedTimeIsOutDated && relativeTimesHaveDiff && (
					<>
						{' '}
						<CloudIcon />{' '}
						<RelativeTime ts={receivedAt} key={receivedAt.toISOString()} />
					</>
				)}
			</span>
		)
	} catch {
		return (
			<span className={'reportedTime'}>
				<CloudIcon />{' '}
				<RelativeTime ts={receivedAt} key={receivedAt.toISOString()} />
			</span>
		)
	}
}
