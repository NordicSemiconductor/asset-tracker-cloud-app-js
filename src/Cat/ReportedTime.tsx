import React from 'react'
import { RelativeTime } from '../RelativeTime/RelativeTime'
import { distanceInWords } from 'date-fns'
import { emojify } from '../Emojify/Emojify'

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
	const reportIsOld = (Date.now() - reportedAt.getTime()) / 1000 > 3600
	try {
		return (
			<span className={'reportedTime'}>
				{reportIsOld ? emojify('🤷 ') : emojify('🕒 ')}
				<RelativeTime ts={reportedAt} key={reportedAt.toISOString()} />
				{reportedTimeIsOutDated && relativeTimesHaveDiff && (
					<>
						{emojify('☁️ ')}
						<RelativeTime ts={receivedAt} key={receivedAt.toISOString()} />
					</>
				)}
			</span>
		)
	} catch {
		return (
			<span className={'reportedTime'}>
				{emojify('☁️ ')}
				<RelativeTime ts={receivedAt} key={receivedAt.toISOString()} />
			</span>
		)
	}
}
