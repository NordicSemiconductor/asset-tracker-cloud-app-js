import React from 'react'
import { About } from '../../About/About'
import { Configuration } from './Configuration'
import { Main } from '../../Styles'
import { User } from './User'
import { SolutionConfigConsumer } from '../App'

export const AboutPage = () => (
	<Main>
		<About />
		<SolutionConfigConsumer>
			{config => <Configuration config={config} />}
		</SolutionConfigConsumer>
		<User />
	</Main>
)
