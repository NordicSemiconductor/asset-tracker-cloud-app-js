import { createRef } from 'react'

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
	onFile: (file: File) => void
}) => {
	const inputRef = createRef<HTMLInputElement>()
	return (
		<input
			{...restProps}
			type="file"
			accept={accept}
			ref={inputRef}
			onChange={() => {
				if ((inputRef?.current?.files?.length ?? 0) > 0) {
					onFile(inputRef?.current?.files?.[0] as File)
				}
			}}
		/>
	)
}
