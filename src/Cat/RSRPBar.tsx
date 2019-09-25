import React from 'react'

export const RSRPBar = ({ quality, ...props }: { quality: number }) => {
	// Calculate the size of the triangle base on the relative area.
	// The resulting triangle should have the area respective to its quality,
	// instead of only having the width/height.
	const t = Math.sqrt(quality * 2)
	const d = t / Math.sqrt(2)
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			version="1.1"
			viewBox="0 0 100 100"
			height="100px"
			width="100px"
			aria-label={`${Math.round(quality * 100)}%`}
			{...props}
		>
			<g>
				<path
					d="M 100,0 V 100 H 0 Z"
					style={{
						fill: '#000000',
						fillOpacity: 0.3,
					}}
				/>
				<path
					d={`M 0,100 l ${Math.round(d * 100)},0 l 0,-${Math.round(d * 100)} Z`}
					style={{
						fill: '#000000',
						fillOpacity: 0.6,
					}}
				/>
			</g>
		</svg>
	)
}
