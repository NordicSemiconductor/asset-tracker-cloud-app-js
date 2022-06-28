import styled from 'styled-components'
import twemoji from 'twemoji'

const Twemoji = styled.span`
	img.emoji {
		height: 1em;
		width: 1em;
		margin: 0 0.05em 0 0.1em;
		vertical-align: -0.1em;
	}
`

export const emojify = (text: string) => (
	<Twemoji
		dangerouslySetInnerHTML={{
			__html: twemoji.parse(text, {
				base: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/12.0.4/2/',
				folder: 'svg',
				ext: '.svg',
			}),
		}}
	/>
)
