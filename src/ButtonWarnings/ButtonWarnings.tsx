import React, { useEffect, useState } from 'react'
import { isAfter } from 'date-fns'

export type DeviceDateMap = {
	[key: string]: Date
}

export type ButtonWarningProps = {
	showButtonWarning: (id: string) => Date | undefined
	snooze: (id: string) => void
	setButtonPresses: React.Dispatch<React.SetStateAction<DeviceDateMap>>
}

export const ButtonWarnings = ({
	children,
}: {
	children: (args: ButtonWarningProps) => JSX.Element
}) => {
	const [buttonSnoozes, setButtonSnoozes] = useState<DeviceDateMap>({})
	const [buttonPresses, setButtonPresses] = useState<DeviceDateMap>({})

	// Read/Set localstorage of button snoozes
	useEffect(() => {
		const snoozes = window.localStorage.getItem(`asset-tracker:catlist:snoozes`)
		if (snoozes !== null) {
			console.log(`Restoring`, JSON.parse(snoozes))
			setButtonSnoozes(
				Object.entries(JSON.parse(snoozes)).reduce(
					(snoozes, [deviceId, ts]) => ({
						...snoozes,
						[deviceId]: new Date(ts as string),
					}),
					{},
				),
			)
		}
	}, [])

	const showButtonWarning = (deviceId: string): Date | undefined => {
		if (buttonPresses[deviceId] === undefined) return
		if (buttonSnoozes[deviceId] === undefined) return buttonPresses[deviceId]
		if (isAfter(buttonPresses[deviceId], buttonSnoozes[deviceId]))
			return buttonPresses[deviceId]
	}
	return children({
		showButtonWarning,
		setButtonPresses,
		snooze: (id: string) => {
			setButtonSnoozes((snoozes) => {
				const u = {
					...snoozes,
					[id]: new Date(),
				}
				console.log(`Storing`, JSON.stringify(u))
				window.localStorage.setItem(
					`asset-tracker:catlist:snoozes`,
					JSON.stringify(u),
				)
				return u
			})
		},
	})
}
