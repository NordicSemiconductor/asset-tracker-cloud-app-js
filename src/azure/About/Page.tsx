import React from 'react'
import { About } from '../../About/About'
import { Configuration } from './Configuration'
import { Main } from '../../Styles'
import { User } from './User'

export const AboutPage = () => (
	<Main>
		<About />
		<Configuration />
		<User />
	</Main>
)
