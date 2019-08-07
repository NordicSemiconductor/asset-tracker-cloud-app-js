import React, { useEffect, useState } from 'react'
import { Alert, Progress } from 'reactstrap'

import './Success.scss'

const lifetime = 5000

export const Success = ({
	title,
	onClose,
}: {
	title: string
	onClose: () => void
}) => {
	const [visible, setVisible] = useState(true)
	const [countdown, setCountdown] = useState(0)

	const close = () => {
		setVisible(false)
		onClose()
	}

	useEffect(() => {
		const start = Date.now()
		let animationFrame: number

		const onFrame = () => {
			const progress = (Date.now() - start) / lifetime
			const cd = Math.round(progress * 100)
			setCountdown(cd)
			if (progress < 1) {
				setTimeout(() => {
					animationFrame = requestAnimationFrame(onFrame)
				}, 200)
			} else {
				setVisible(false)
				cancelAnimationFrame(animationFrame)
				onClose()
			}
		}

		animationFrame = requestAnimationFrame(onFrame)

		return () => {
			animationFrame && cancelAnimationFrame(animationFrame)
		}
	}, [title, onClose])
	if (!visible) return null
	return (
		<Alert color={'success'} className={'self-closing'} onClick={close}>
			<span>{title}</span>
			<Progress value={countdown} color={'success'} />
		</Alert>
	)
}
