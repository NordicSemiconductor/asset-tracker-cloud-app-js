import React, { useState, useEffect } from 'react'
import moment from 'moment'


const getDiffInSeconds = (ts: string) => (Date.now() - new Date(ts).getTime()) / 1000

export const RelativeTime = ({ ts }: { ts: string }) => {
	const [label, setLabel] = useState(moment(ts).fromNow())
	const [diffInSeconds, setDiffInSeconds] = useState(getDiffInSeconds(ts))

	useEffect(() => {
			const updateDiffInSeconds = () => {
				setDiffInSeconds(getDiffInSeconds(ts))
				setLabel(moment(ts).fromNow())
			}

			if (diffInSeconds < 60) {
				setTimeout(updateDiffInSeconds, 1000)
			} else {
				setTimeout(updateDiffInSeconds, 1000 * 60)
			}
		},
		[diffInSeconds, ts],
	)

	return <time dateTime={ts}>{label}</time>
}
