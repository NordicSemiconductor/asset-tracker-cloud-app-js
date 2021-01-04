import React, { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

const getDiffInSeconds = (ts: Date) => (Date.now() - ts.getTime()) / 1000

export const RelativeTime = ({ ts }: { ts: Date }) => {
	const [label, setLabel] = useState(
		formatDistanceToNow(ts, { includeSeconds: true, addSuffix: true }),
	)
	const [diffInSeconds, setDiffInSeconds] = useState(getDiffInSeconds(ts))

	useEffect(() => {
		const updateDiffInSeconds = () => {
			const d = getDiffInSeconds(ts)
			setDiffInSeconds(d)
			setLabel(
				formatDistanceToNow(ts, { includeSeconds: true, addSuffix: true }),
			)
		}

		let t: NodeJS.Timeout

		if (Math.abs(diffInSeconds) < 60) {
			t = setTimeout(updateDiffInSeconds, 1000 * 5)
		} else {
			t = setTimeout(updateDiffInSeconds, 1000 * 60)
		}

		return () => {
			clearTimeout(t)
		}
	}, [diffInSeconds, ts])

	return <time dateTime={ts.toISOString()}>{label}</time>
}
