import React, { createRef } from 'react'

const avatarSize = 75

export const AvatarPicker = ({
	onChange,
	children,
	className,
}: {
	onChange: (data: Blob) => void
	className?: string
	children: React.ReactElement<any>
}) => {
	const canvasRef = createRef<HTMLCanvasElement>()
	const inputRef = createRef<HTMLInputElement>()
	return (
		<div className={`avatar-picker ${className}`}>
			{React.cloneElement(children, {
				onClick: () => {
					inputRef && inputRef.current && inputRef.current.click()
				},
			})}
			<input
				type="file"
				accept="image/*"
				ref={inputRef}
				style={{ display: 'none' }}
				onChange={() => {
					if (
						inputRef &&
						inputRef.current &&
						inputRef.current.files &&
						inputRef.current.files.length
					) {
						const reader = new FileReader()
						reader.onload = (e: any) => {
							if (canvasRef.current) {
								const canvas = canvasRef.current
								const ctx = canvas.getContext('2d')
								if (ctx) {
									const img = new Image()
									img.onload = () => {
										canvas.width = avatarSize
										canvas.height = avatarSize
										if (img.width > img.height) {
											const w = (avatarSize / img.height) * img.width
											ctx.drawImage(img, (avatarSize - w) / 2, 0, w, avatarSize)
										} else {
											const h = (avatarSize / img.width) * img.height
											ctx.drawImage(img, 0, (avatarSize - h) / 2, avatarSize, h)
										}
										canvas.toBlob(
											blob => {
												if (blob) {
													onChange(blob)
												}
											},
											'image/jpeg',
											0.8,
										)
									}
									img.src = e.target.result
								}
							}
						}
						reader.readAsDataURL(inputRef.current.files[0])
					}
				}}
			/>
			<canvas ref={canvasRef} style={{ display: 'none' }} />
		</div>
	)
}
