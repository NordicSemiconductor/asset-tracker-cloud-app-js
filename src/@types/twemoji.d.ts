declare module 'twemoji' {
	export function parse(
		text: string,
		options?: Partial<{
			callback: Function // default the common replacer
			attributes: Function // default returns {}
			base: string // default MaxCDN
			ext: string // default ".png"
			className: string // default "emoji"
			size: string | number // default "36x36"
			folder: string // in case it's specified it replaces .size info, if any
		}>,
	): string
}
