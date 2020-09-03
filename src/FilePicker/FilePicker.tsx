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
	onFile: (result: { file: File; data: ArrayBuffer }) => void
}): React.ReactElement => {
	const inputRef = createRef<HTMLInputElement>()
	return (
		<input
			{...restProps}
			type="file"
			accept={accept}
			ref={inputRef}
			onChange={() => {
				if ((inputRef?.current?.files?.length ?? 0) > 0) {
					const f = inputRef?.current?.files?.[0] as File
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
						reader.readAsArrayBuffer(f)
					}
				}
			}}
		/>
	)
}
