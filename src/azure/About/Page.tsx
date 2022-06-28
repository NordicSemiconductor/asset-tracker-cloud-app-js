import { ReactAppConfigConsumer } from '../..'
import { About } from '../../About/About'
import { Main } from '../../Styles'
import { AccessTokenConsumer, SolutionConfigConsumer } from '../App'
import { Configuration } from './Configuration'
import { User } from './User'

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
