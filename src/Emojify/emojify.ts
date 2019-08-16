import { parse } from 'twemoji'

export const emojify = (text: string): string =>
	parse(text, {
		folder: 'svg',
		ext: '.svg',
	})
