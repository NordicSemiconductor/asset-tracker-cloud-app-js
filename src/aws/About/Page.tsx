import React from 'react'
import { About } from '../../About/About'
import { Configuration } from './Configuration'
import { User } from './User'
import { Main } from '../../Styles'
import { Cache } from './Cache'
import { ReactAppConfigConsumer } from '../..'
import { StackConfigConsumer, CredentialsConsumer } from '../App'

export const AboutPage = () => (
	<Main>
		<ReactAppConfigConsumer>
			{config => <About config={config} />}
		</ReactAppConfigConsumer>
		<CredentialsConsumer>
			{({ identityId }) => <User identityId={identityId} />}
		</CredentialsConsumer>
		<StackConfigConsumer>
			{config => <Configuration config={config} />}
		</StackConfigConsumer>
		<Cache />
	</Main>
)
