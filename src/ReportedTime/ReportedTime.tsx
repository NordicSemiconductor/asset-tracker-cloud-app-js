import React from 'react'
import { RelativeTime } from '../RelativeTime/RelativeTime'
import { formatDistanceToNow } from 'date-fns'
import { emojify } from '../theme/Emojify/Emojify'
import styled from 'styled-components'

const OutDatedSpan = styled.span`
	margin-left: 0.5rem;
`

const Warning = styled.abbr`
	padding: 0.25rem;
`

const OldWarning = ({
	reportIsOld,
	staleAfterSeconds,
}: {
	staleAfterSeconds: number
	reportIsOld: boolean
}) => {
	if (!reportIsOld) return null
	return (
		<Warning
			title={`The device is expected to report updates roughly every ${staleAfterSeconds} seconds, but the data is older.`}
		>
			{emojify('⚠️')}
		</Warning>
	)
}

export const ReportedTime = ({
	reportedAt,
	receivedAt,
	staleAfterSeconds,
	...restProps
}: {
	reportedAt: Date
	receivedAt: Date
	staleAfterSeconds?: number
}) => {
	const reportedTimeIsOutDated =
		(receivedAt.getTime() - reportedAt.getTime()) / 1000 > 300
	const relativeTimesHaveDiff =
		formatDistanceToNow(receivedAt, {
			includeSeconds: true,
			addSuffix: true,
		}) !==
		formatDistanceToNow(reportedAt, {
			includeSeconds: true,
			addSuffix: true,
		})
	const reportIsOld =
		(Date.now() - reportedAt.getTime()) / 1000 >
		(staleAfterSeconds ?? Number.MAX_SAFE_INTEGER)
	try {
		return (
			<span className={'reportedTime'} {...restProps}>
				{reportIsOld ? emojify('🤷 ') : emojify('🕒 ')}
				<RelativeTime ts={reportedAt} key={reportedAt.toISOString()} />
				{reportedTimeIsOutDated && relativeTimesHaveDiff && (
					<OutDatedSpan>
						{emojify('☁️ ')}
						<RelativeTime ts={receivedAt} key={receivedAt.toISOString()} />
					</OutDatedSpan>
				)}
				{staleAfterSeconds !== undefined && (
					<OldWarning
						reportIsOld={reportIsOld}
						staleAfterSeconds={staleAfterSeconds}
					/>
				)}
			</span>
		)
	} catch {
		return (
			<span className={'reportedTime'} {...restProps}>
				{emojify('☁️ ')}
				<RelativeTime ts={receivedAt} key={receivedAt.toISOString()} />
				{staleAfterSeconds !== undefined && (
					<OldWarning
						reportIsOld={reportIsOld}
						staleAfterSeconds={staleAfterSeconds}
					/>
				)}
			</span>
		)
	}
}
