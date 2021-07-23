import React from 'react'
import { Configuration } from '../../theme/bootstrap4/azure/About/Configuration'
import { Main } from '../../Styles'
import { User } from '../../theme/bootstrap4/azure/About/User'
import { SolutionConfigConsumer, AccessTokenConsumer } from '../App'
import { About } from '../../theme/bootstrap4/About/About'

export const AboutPage = ({ version }: { version: string }) => (
	<Main>
		<About version={version} />
		<AccessTokenConsumer>
			{(credentials) => <User accessToken={credentials} />}
		</AccessTokenConsumer>
		<SolutionConfigConsumer>
			{(config) => <Configuration config={config} />}
		</SolutionConfigConsumer>
	</Main>
)
