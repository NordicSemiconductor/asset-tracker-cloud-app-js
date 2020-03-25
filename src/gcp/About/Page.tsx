import React from 'react'
import { About } from '../../About/About'
import { Configuration } from './Configuration'
import { Main } from '../../Styles'
import { ReactAppConfigConsumer } from '../..'
import { CloudConfigConsumer } from '../App'

export const AboutPage = () => (
	<Main>
		<ReactAppConfigConsumer>
			{config => <About config={config} />}
		</ReactAppConfigConsumer>
		<CloudConfigConsumer>
			{config => <Configuration config={config} />}
		</CloudConfigConsumer>
	</Main>
)
