import React from 'react'
import { About } from '../../About/About'
import { Configuration } from './Configuration'
import { Main } from '../../Styles'
import { User } from './User'
import { SolutionConfigConsumer, AccessTokenConsumer } from '../App'
import { ReactAppConfigConsumer } from '../..'

export const AboutPage = () => (
	<Main>
		<ReactAppConfigConsumer>
			{(config) => <About config={config} />}
		</ReactAppConfigConsumer>
		<AccessTokenConsumer>
			{(credentials) => <User accessToken={credentials} />}
		</AccessTokenConsumer>
		<SolutionConfigConsumer>
			{(config) => <Configuration config={config} />}
		</SolutionConfigConsumer>
	</Main>
)
