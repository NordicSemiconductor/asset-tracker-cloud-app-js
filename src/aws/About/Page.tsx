import React from 'react'
import { Configuration } from '../../theme/bootstrap4/aws/About/Configuration'
import { User } from './User'
import { Main } from '../../theme/bootstrap4/Styles'
import { ClearCache } from '../../theme/bootstrap4/About/ClearCache'
import { StackConfigConsumer, CredentialsConsumer } from '../App'
import { Cache as AmplifyCache } from 'aws-amplify'
import { About } from '../../theme/bootstrap4/About/About'
import { User as UserTheme } from '../../theme/bootstrap4/aws/About/User'

export const AboutPage = ({ version }: { version: string }) => (
	<Main>
		<About version={version} />
		<CredentialsConsumer>
			{({ identityId }) => <User identityId={identityId} render={UserTheme} />}
		</CredentialsConsumer>
		<StackConfigConsumer>
			{(config) => <Configuration config={config} />}
		</StackConfigConsumer>
		<ClearCache
			onClick={() => {
				AmplifyCache.clear()
			}}
		/>
	</Main>
)
