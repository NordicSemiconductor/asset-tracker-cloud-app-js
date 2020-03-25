import React from 'react'
import { About } from '../../About/About'
import { Configuration } from './Configuration'
import { Main } from '../../Styles'
import { User } from './User'
import { SolutionConfigConsumer } from '../App'
import { ReactAppConfigConsumer } from '../..'

export const AboutPage = () => (
	<Main>
		<ReactAppConfigConsumer>
			{config => <About config={config} />}
		</ReactAppConfigConsumer>
		<SolutionConfigConsumer>
			{config => <Configuration config={config} />}
		</SolutionConfigConsumer>
		<User />
	</Main>
)
