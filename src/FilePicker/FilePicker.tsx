import React, { createRef } from 'react'

export const FilePicker = ({
	accept,
	maxSize,
	onError,
	onFile,
	...restProps
}: {
	[key: string]: any
	accept: string
	maxSize: number
	onError: (result: Error) => void
	onFile: (result: { file: File; data: Blob }) => void
}) => {
	const inputRef = createRef<HTMLInputElement>()
	return (
		<input
			{...restProps}
			type="file"
			accept={accept}
			ref={inputRef}
			onChange={() => {
				if (
					inputRef &&
					inputRef.current &&
					inputRef.current.files &&
					inputRef.current.files.length
				) {
					const f = inputRef.current.files[0]
					if (f.size > maxSize) {
						onError(new Error(`Filesize ${f.size} is too large!`))
					} else {
						const reader = new FileReader()
						reader.onload = (e: any) => {
							onFile({
								file: f,
								data: e.target.result,
							})
						}
						reader.readAsBinaryString(f)
					}
				}
			}}
		/>
	)
}
