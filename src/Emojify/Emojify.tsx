import React from 'react'
import { default as twemoji } from '@bifravst/twemoji'

import './Twemoji.scss'

export const emojify = (text: string) => (
	<span
		dangerouslySetInnerHTML={{
			__html: twemoji.parse(text, {
				base: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/12.0.4/2/',
				folder: 'svg',
				ext: '.svg',
			}),
		}}
	/>
)
