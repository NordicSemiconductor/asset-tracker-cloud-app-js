import React from 'react'
import { Main } from '../../Styles'
import { ApiClientConsumer } from '../App'
import { List } from './List'

export const CatsPage = () => (
	<Main>
		<ApiClientConsumer>
			{apiClient => <List apiClient={apiClient} />}
		</ApiClientConsumer>
	</Main>
)
