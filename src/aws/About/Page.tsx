import React from 'react'
import { About } from '../../About/About'
import { Configuration } from './Configuration'
import { Main } from '../../Styles'
import { Cache } from './Cache'
import { ReactAppConfigConsumer } from '../..'
import { StackConfigConsumer } from '../App'

export const AboutPage = () => (
	<Main>
		<ReactAppConfigConsumer>
			{config => <About config={config} />}
		</ReactAppConfigConsumer>
		<StackConfigConsumer>
			{config => <Configuration config={config} />}
		</StackConfigConsumer>
		<Cache />
	</Main>
)
