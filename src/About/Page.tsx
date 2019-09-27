import React from 'react'
import { About } from './About'
import { Configuration } from './Configuration'
import { Main } from '../Styles'
import { Cache } from './Cache'

export const AboutPage = () => (
	<Main>
		<About />
		<Configuration />
		<Cache />
	</Main>
)
