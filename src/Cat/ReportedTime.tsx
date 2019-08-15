import React from 'react'
import { RelativeTime } from '../RelativeTime/RelativeTime'
import {
	AccessTimeRounded as TimeIcon,
	CloudDone as CloudIcon,
} from '@material-ui/icons'
import { distanceInWords } from 'date-fns'
import { TextWithIcon } from '../TextWithIcon/TextWithIcon'

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
				<TextWithIcon icon={<TimeIcon />}>
					<RelativeTime ts={reportedAt} key={reportedAt.toISOString()} />
				</TextWithIcon>
				{reportedTimeIsOutDated && relativeTimesHaveDiff && (
					<TextWithIcon icon={<CloudIcon />}>
						<RelativeTime ts={receivedAt} key={receivedAt.toISOString()} />
					</TextWithIcon>
				)}
			</span>
		)
	} catch {
		return (
			<span className={'reportedTime'}>
				<TextWithIcon icon={<CloudIcon />}>
					<RelativeTime ts={receivedAt} key={receivedAt.toISOString()} />
				</TextWithIcon>
			</span>
		)
	}
}
