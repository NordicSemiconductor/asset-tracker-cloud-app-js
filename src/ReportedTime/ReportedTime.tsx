import React from 'react'
import { RelativeTime } from '../RelativeTime/RelativeTime'
import { formatDistanceToNow } from 'date-fns'
import { emojify } from '../Emojify/Emojify'
import styled from 'styled-components'

const OutDatedSpan = styled.span`
	margin-left: 0.5rem;
`

export const ReportedTime = (props: { reportedAt: Date; receivedAt: Date }) => {
	const { reportedAt, receivedAt, ...restProps } = props
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
	const reportIsOld = (Date.now() - reportedAt.getTime()) / 1000 > 3600
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
			</span>
		)
	} catch {
		return (
			<span className={'reportedTime'} {...restProps}>
				{emojify('☁️ ')}
				<RelativeTime ts={receivedAt} key={receivedAt.toISOString()} />
			</span>
		)
	}
}
